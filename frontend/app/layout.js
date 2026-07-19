import "./globals.css";
import { GrowthProvider } from "./providers";
import Shell from "./shell";

export const metadata = {
  title: {
    default: "Growth OS · 让长期目标持续抵达",
    template: "%s · Growth OS",
  },
  description: "把长期目标变成今天能完成的动作，并根据真实执行持续重新规划。",
  applicationName: "Growth OS",
  keywords: ["目标管理", "AI 规划", "习惯养成", "成长复盘"],
};

export const viewport = {
  themeColor: "#17343a",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <GrowthProvider>
          <Shell>{children}</Shell>
        </GrowthProvider>
      </body>
    </html>
  );
}
