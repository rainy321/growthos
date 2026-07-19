import os
import sys
import unittest
from pathlib import Path


BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))
os.environ.setdefault("SESSION_SECRET", "test-secret-that-is-long-enough-for-tests")

import auth


class AuthTests(unittest.TestCase):
    def test_password_hash_is_salted_and_verifiable(self):
        first = auth.hash_pw("correct horse battery staple")
        second = auth.hash_pw("correct horse battery staple")
        self.assertNotEqual(first, second)
        self.assertTrue(auth.verify_pw("correct horse battery staple", first))
        self.assertFalse(auth.verify_pw("wrong", first))

    def test_session_token_expires_and_rejects_tampering(self):
        token = auth.create_token("user_123", ttl_seconds=60)
        self.assertEqual(auth.verify_token(token), "user_123")
        self.assertIsNone(auth.verify_token(token + "x"))
        self.assertIsNone(auth.verify_token(auth.create_token("user_123", ttl_seconds=-1)))


if __name__ == "__main__":
    unittest.main()
