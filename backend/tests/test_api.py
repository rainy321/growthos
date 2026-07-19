import os
import sys
import tempfile
import unittest
from pathlib import Path


BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))
TEST_DIR = tempfile.TemporaryDirectory()
os.environ["DATABASE_PATH"] = str(Path(TEST_DIR.name) / "growth_os_test.db")
os.environ["SESSION_SECRET"] = "test-secret-that-is-long-enough-for-tests"
os.environ["AI_MOCK"] = "1"
os.environ["SEED_DEMO_DATA"] = "0"

from fastapi.testclient import TestClient
import main


class ApiFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.context = TestClient(main.app)
        cls.client = cls.context.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.context.__exit__(None, None, None)
        TEST_DIR.cleanup()

    def register(self, name):
        response = self.client.post(
            "/api/auth/register",
            json={"name": name, "password": "secure-pass-123", "baseline": "每天 1 小时"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        return payload, {"Authorization": f"Bearer {payload['token']}"}

    def test_health_exposes_release_and_ai_mode(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["ai_mode"], "mock")
        self.assertEqual(response.json()["version"], "1.0.0-rc.1")

    def test_registration_requires_a_strong_password(self):
        response = self.client.post("/api/auth/register", json={"name": "测试用户", "password": "123456"})
        self.assertEqual(response.status_code, 400)

    def test_authenticated_goal_task_and_checkin_flow(self):
        user, headers = self.register("航线用户")
        goal_response = self.client.post(
            "/api/goals",
            headers=headers,
            json={
                "user_id": user["id"],
                "title": "30 天建立稳定写作习惯",
                "category": "学习",
                "time_horizon": "30天",
                "start_date": "2026-07-19",
            },
        )
        self.assertEqual(goal_response.status_code, 200, goal_response.text)
        goal = goal_response.json()
        self.assertTrue(goal["decomposition"]["phases"])

        task_response = self.client.post(
            "/api/tasks",
            headers=headers,
            json={"goal_id": goal["id"], "date": "2026-07-19", "content": "专注写作 25 分钟", "difficulty": "中"},
        )
        self.assertEqual(task_response.status_code, 200, task_response.text)
        task = task_response.json()

        checkin = self.client.post(
            f"/api/tasks/{task['id']}/checkin",
            headers=headers,
            json={"done": True, "quality": 4, "notes": "上午完成"},
        )
        self.assertEqual(checkin.status_code, 200, checkin.text)

        dashboard = self.client.get(f"/api/dashboard?user_id={user['id']}", headers=headers)
        self.assertEqual(dashboard.status_code, 200, dashboard.text)
        self.assertEqual(dashboard.json()["done"], 1)

    def test_sessions_cannot_read_another_users_data(self):
        first, first_headers = self.register("隔离用户甲")
        second, second_headers = self.register("隔离用户乙")
        response = self.client.get(f"/api/goals?user_id={first['id']}", headers=second_headers)
        self.assertEqual(response.status_code, 403)
        own = self.client.get(f"/api/goals?user_id={first['id']}", headers=first_headers)
        self.assertEqual(own.status_code, 200)


if __name__ == "__main__":
    unittest.main()
