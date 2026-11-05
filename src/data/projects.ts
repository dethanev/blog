import type { ImageMetadata } from "astro";
import quizlabImage from "~/assets/projects/quizlab.png";
import algolabImage from "~/assets/projects/algolab.png";

export interface Project {
  name: string;
  description: string;
  status: string;
  color: "paper" | "pink" | "yellow" | "lime" | "violet";
  stack: string[];
  /** Live site of the project, opened in a new tab. */
  siteUrl?: string;
  /** Related post on this blog. */
  href?: string;
  image?: { src: ImageMetadata; alt: string };
  /** Featured projects are the live labs shown first. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: "QuizLab",
    description: "智慧考題學習實驗室・匯入 PDF 或文字題庫，透過互動作答、即時解析與錯題複習，幫助理解知識而非死背答案，並依照自己的學習進度反覆練習，讓考試準備更有效率。",
    status: "Live",
    color: "lime",
    stack: ["Nuxt 4", "Tailwind v4", "PWA", "IndexedDB"],
    siteUrl: "https://quizlab.dethanev.app/",
    image: { src: quizlabImage, alt: "智慧考題學習實驗室 Dethanev QuizLab 網站封面" },
    featured: true,
  },
  {
    name: "AlgoLab",
    description: "演算法視覺化實驗室・貼上 Python 程式碼，透過逐步執行、變數追蹤與資料結構視覺化，幫助理解程式邏輯與演算法原理，並能自由控制執行步驟，讓抽象的演算法變得更直觀。",
    status: "Live",
    color: "yellow",
    stack: ["Nuxt", "Pyodide", "CodeMirror", "Web Worker"],
    siteUrl: "https://algolab.dethanev.app/",
    image: { src: algolabImage, alt: "演算法視覺化實驗室 Dethanev AlgoLab 網站封面" },
    featured: true,
  },
  {
    name: "this blog",
    description: "你正在看的這個網站。用 Astro 靜態產生，Neubrutalism 風格加上少量 GSAP 動效，放開發筆記、專案紀錄和近況。",
    status: "Live",
    color: "lime",
    stack: ["Astro", "Tailwind v4", "GSAP"],
    href: "/blog/2026-05-10-astro-6-tailwind-v4/",
  },
  {
    name: "LinkPet",
    description: "AR 與 AI 陪伴 App 概念，讓虛擬角色在 2D / AR 模式出現在生活空間裡，支援語音互動、觸碰與餵食反應。雙人合作的比賽型專案練習。",
    status: "Prototype",
    color: "pink",
    stack: ["SwiftUI", "ARKit", "RealityKit"],
    href: "/blog/2026-04-18-linkpet-ar-ai-companion/",
  },
  {
    name: "DriveWorth",
    description: "買車前的養車成本評估工具，用里程節點預算卡把保養、稅金、保險和油耗變成白話的長期成本提醒。",
    status: "Prototype",
    color: "violet",
    stack: ["Flutter", "Data Model"],
    href: "/blog/2026-02-11-driveworth-app/",
  },
  {
    name: "HawkGuard",
    description: "反詐騙 App 概念，輸入文字、網址、電話或圖片後取得風險提示，並整合分析紀錄與社群回報。",
    status: "Prototype",
    color: "paper",
    stack: ["Flutter"],
    href: "/blog/2025-12-03-hawkguard-app/",
  },
  {
    name: "Tap2Go",
    description: "第一個自己完成的 Flutter App，從環境安裝、頁面切換、互動回饋到 Android APK Release 都走過一次。",
    status: "Practice",
    color: "yellow",
    stack: ["Flutter", "Dart"],
    href: "/blog/2025-08-07-tap2go-flutter-ui-practice/",
  },
];
