/**
 * The apps for musicians: the homepage's Apps section, the app pages and their structured data all read this.
 *
 * Every app here must be about making music; that is the concept of the section. Claims must be true on the day
 * they are published, and only what the app's own repository documents:
 * - Chord to MIDI: chord-to-midi-web (content/, site.config.json). DAW drag and ads are left out while the
 *   extension is not on the Chrome Web Store and AdSense has not approved the site.
 * - Mac Get Space, called Storage Review until its rename: mac-get-space (README, docs/05-protection-defaults.md, docs/09-distribution.md,
 *   docs/12-privacy-policy-draft.md, docs/plans/free-vs-expert-version.md). No price: the App Store sets it.
 *   Protection is described as what the default rules exclude from removal, with its limits, never as a guarantee.
 *   Its screenshots come from a development build with sample data and say so on the page.
 * Not introduced here: MIDI Utility (not public) and the Thai app (not a music app).
 */

import type { LucideIcon } from "lucide-react";
import { HardDrive, KeyboardMusic } from "lucide-react";
import type { SupportedLanguage } from "./language-detection";

export type AppSlug = "chord-to-midi" | "mac-get-space";

/** Order of the apps on the homepage and under "More apps" */
export const APP_SLUGS: AppSlug[] = ["chord-to-midi", "mac-get-space"];

export interface AppImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** Label shown with the image, such as "Development build · sample data"; such images stay out of the JSON-LD */
  note?: string;
}

export interface AppSection {
  title: string;
  intro?: string;
  /** "steps" numbers the items */
  style?: "cards" | "steps";
  items: { title: string; text: string }[];
  note?: string;
}

export interface AppContent {
  name: string;
  /** Availability, shown as a badge */
  status: string;
  tagline: string;
  /** The homepage card's text */
  summary: string;
  /** The homepage card's bullets; also the structured data's featureList */
  highlights: string[];
  /** Opening paragraphs of the app page */
  intro: string[];
  /** Link to the app itself; absent while the app is not available */
  cta?: { label: string; href: string };
  screenshots: AppImage[];
  sections: AppSection[];
  /** Shown on the app page and repeated in its FAQPage structured data */
  faq: { question: string; answer: string }[];
  /** Support line; "{email}" becomes a mail link to supportEmail */
  support: string;
}

export interface AppInfo {
  slug: AppSlug;
  /** Square app icon; without one, fallbackIcon is drawn on a tile */
  icon?: string;
  fallbackIcon: LucideIcon;
  /** Link preview image per language, 1200 x 630 */
  ogImage: Record<SupportedLanguage, string>;
  supportEmail: string;
  /** The app's privacy policy on this site, once it is published there */
  privacyPolicyPath?: string;
  /** schema.org facts for the app page's structured data */
  schema: {
    type: "WebApplication" | "SoftwareApplication";
    applicationCategory: string;
    operatingSystem: string;
    /** Every feature is free; adds an Offer with price 0 */
    free?: boolean;
  };
  content: Record<SupportedLanguage, AppContent>;
}

const SUPPORT_EMAIL = "contact@cultureand.tech";

const chordToMidi: AppInfo = {
  slug: "chord-to-midi",
  icon: "/images/apps/chord-to-midi/icon.png",
  fallbackIcon: KeyboardMusic,
  ogImage: { en: "/images/apps/chord-to-midi/og.png", ko: "/images/apps/chord-to-midi/og.png" },
  supportEmail: SUPPORT_EMAIL,
  schema: {
    type: "WebApplication",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (web browser)",
    free: true,
  },
  content: {
    en: {
      name: "Chord to MIDI",
      status: "Free web app",
      tagline: "Hear a chord progression, then drag it straight into your DAW.",
      summary:
        "Type a progression, hear it on a piano and drag and drop it straight into your DAW. Import a MIDI file and it analyzes the harmony into a chord progression. Free to use in your browser.",
      highlights: [
        "Reads chord spellings from real charts, from Cm7-5 and CΔ7 to E7/G#",
        "Reads a MIDI file's harmony as chord symbols, spelled for the song's key",
        "Runs in your browser: progressions and MIDI files are never uploaded",
        "Free, with nothing to install, right in your web browser",
      ],
      intro: [
        "You can hear the changes in your head. Chord to MIDI gets them into your DAW without drawing every note by hand.",
        "Type a progression such as Am7 - [Dm7 - G7] - Cmaj7(x2), press Generate, then Play to hear it on a piano. Download the MIDI file and drag it into your DAW, or open a MIDI file to read its harmony as a chord progression.",
      ],
      cta: { label: "Open Chord to MIDI", href: "https://chord-to-midi.app/" },
      screenshots: [
        {
          src: "/images/apps/chord-to-midi/tool-en.png",
          width: 1248,
          height: 642,
          alt: "Chord to MIDI with the progression Am7 - [Dm7 - G7] - Cmaj7(x2) - E7/G# on a chord track, the MIDI clip below it and the notes of the selected chord",
          caption: "The chords on a track, the MIDI clip ready to download, and the notes of the selected chord.",
        },
      ],
      sections: [
        {
          title: "Made for sketching harmony",
          intro:
            "For songwriters, producers and arrangers who think in chord symbols. Sketch the changes for a verse, try a reharmonization, or get a J-pop royal road progression or a K-pop ballad full of slash chords into your DAW.",
          items: [
            {
              title: "Write it the way charts do",
              text: "It understands the spellings on real charts, from Cm7-5 and CΔ7 to C7(#9) and E7/G#. If it doesn't know a chord, it tells you which one instead of guessing.",
            },
            {
              title: "Hear it before you commit",
              text: "The clip plays on a piano. Click any chord to hear it on its own and see its notes.",
            },
            {
              title: "Read the chords of a MIDI file",
              text: "Open or drop a .mid file and Chord to MIDI analyzes its harmony and writes it out as a progression, with the tempo from the file and the names spelled the way a chart in the song's key would write them. It makes a chord chart, not a note-for-note transcription of the file.",
            },
            {
              title: "Your music stays on your device",
              text: "The chord engine runs in your browser as WebAssembly. Your progressions and MIDI files are processed on your device and never uploaded.",
            },
          ],
        },
      ],
      faq: [
        {
          question: "Is Chord to MIDI free?",
          answer:
            "Yes. Every feature is free to use, and you don't need an account to type, play, download or import.",
        },
        {
          question: "Which DAWs can use the MIDI file?",
          answer:
            "Any DAW or music app that can import a standard MIDI file (.mid). The file holds the tempo, a 4/4 time signature and one track of block chords set to the General MIDI acoustic grand piano, so you can play it with any instrument.",
        },
        {
          question: "Are my progressions or MIDI files uploaded?",
          answer:
            "No. They are processed on your device and never uploaded. Share links keep the progression after the # in the address, the part browsers never send to a server.",
        },
        {
          question: "Can I use the MIDI files in my own songs?",
          answer:
            "Yes. The progressions you type and the MIDI files you make with Chord to MIDI are yours to use, commercial releases included.",
        },
        {
          question: "Does it work on phones and tablets?",
          answer:
            "Yes. Typing, playback, import and download all work in mobile browsers. On iPhone and iPad, Safari saves the downloaded .mid file to the Files app.",
        },
      ],
      support: "Questions, bug reports and ideas are welcome at {email}.",
    },
    ko: {
      name: "Chord to MIDI",
      status: "무료 웹 앱",
      tagline: "코드 진행을 듣고 DAW에 끌어서 바로 사용하세요.",
      summary:
        "코드 진행을 입력해 피아노로 들어 보고 DAW에 Drag-and-drop으로 바로 사용하세요. 역으로 MIDI 파일을 가져오면 화성을 분석해 코드 진행으로 정리합니다. 브라우저에서 무료로 사용이 가능합니다.",
      highlights: [
        "Cm7-5, CΔ7부터 E7/G#까지 실제 코드 악보의 표기를 이해합니다",
        "MIDI 파일의 화성을 분석해 곡의 조에 맞춘 코드 진행으로 정리합니다",
        "브라우저 안에서 실행되어 코드 진행과 MIDI 파일을 업로드하지 않습니다",
        "설치 없이 무료로, 웹브라우저에서 직접 사용이 가능합니다",
      ],
      intro: [
        "머릿속에 들리는 코드 진행을 음표 하나하나 그리지 않고 DAW로 옮기세요.",
        "Am7 - [Dm7 - G7] - Cmaj7(x2)처럼 코드 진행을 입력해 생성한 뒤 재생을 누르면 피아노로 들어 볼 수 있습니다. MIDI 파일을 내려받아 DAW로 끌어다 놓거나, 반대로 MIDI 파일을 열어 화성을 코드 진행으로 정리해 보세요.",
      ],
      cta: { label: "Chord to MIDI 열기", href: "https://chord-to-midi.app/ko/" },
      screenshots: [
        {
          src: "/images/apps/chord-to-midi/tool-ko.png",
          width: 1248,
          height: 642,
          alt: "Chord to MIDI 화면: 코드 진행 Am7 - [Dm7 - G7] - Cmaj7(x2) - E7/G#의 코드 트랙과 MIDI 클립, 선택한 코드의 구성음",
          caption: "코드 트랙, 내려받을 MIDI 클립, 선택한 코드의 구성음이 한 화면에 보입니다.",
        },
      ],
      sections: [
        {
          title: "화성을 스케치하는 도구",
          intro:
            "코드 심벌로 생각하는 작곡가, 프로듀서, 편곡자를 위한 도구입니다. 벌스의 코드를 스케치하거나 리하모니제이션을 시도해 보고, J-pop의 왕도 진행이나 슬래시 코드가 많은 K-pop 발라드 진행을 DAW로 옮겨 보세요.",
          items: [
            {
              title: "코드 악보에 쓰는 그대로",
              text: "Cm7-5, CΔ7부터 C7(#9), E7/G#까지 실제 코드 악보의 표기를 이해합니다. 모르는 코드는 추측하지 않고 어떤 코드인지 알려 줍니다.",
            },
            {
              title: "넣기 전에 먼저 듣기",
              text: "클립이 피아노로 재생됩니다. 코드를 클릭하면 그 코드만 들리고 구성음이 표시됩니다.",
            },
            {
              title: "MIDI 파일의 코드 읽기",
              text: ".mid 파일을 열거나 끌어다 놓으면 화성을 분석해 코드 진행으로 적어 줍니다. 템포는 파일에서 가져오고, 코드 이름은 곡의 조에 맞춰 코드 악보식으로 표기합니다. 음을 하나하나 옮겨 적는 기능이 아니라 코드 악보를 만드는 기능입니다.",
            },
            {
              title: "음악은 기기 안에서만",
              text: "코드 엔진은 WebAssembly로 브라우저 안에서 실행됩니다. 코드 진행과 MIDI 파일은 기기에서만 처리되며 업로드되지 않습니다.",
            },
          ],
        },
      ],
      faq: [
        {
          question: "Chord to MIDI는 무료인가요?",
          answer:
            "네. 모든 기능을 무료로 쓸 수 있고, 코드 진행 입력, 재생, 다운로드, MIDI 가져오기에는 계정이 필요 없습니다.",
        },
        {
          question: "어떤 DAW에서 MIDI 파일을 쓸 수 있나요?",
          answer:
            "표준 MIDI 파일(.mid)을 불러올 수 있는 DAW나 음악 앱이라면 어디서든 쓸 수 있습니다. 파일에는 템포, 4/4박자, General MIDI 어쿠스틱 그랜드 피아노로 지정한 블록 코드 트랙 하나가 들어 있어 어떤 악기로든 연주할 수 있습니다.",
        },
        {
          question: "코드 진행이나 MIDI 파일이 업로드되나요?",
          answer:
            "아니요. 사용자의 기기에서만 처리되며 업로드되지 않습니다. 공유 링크도 코드 진행을 주소의 # 뒤에 담는데, 이 부분은 브라우저가 서버로 보내지 않습니다.",
        },
        {
          question: "만든 MIDI 파일을 제 곡에 써도 되나요?",
          answer:
            "네. 입력한 코드 진행과 Chord to MIDI로 만든 MIDI 파일은 상업적 발매를 포함해 자유롭게 쓸 수 있습니다.",
        },
        {
          question: "휴대폰이나 태블릿에서도 되나요?",
          answer:
            "네. 모바일 브라우저에서도 입력, 재생, 가져오기, 다운로드를 모두 할 수 있습니다. iPhone과 iPad의 Safari는 내려받은 .mid 파일을 파일 앱에 저장합니다.",
        },
      ],
      support: "질문, 버그 제보, 아이디어는 {email}로 보내 주세요.",
    },
  },
};

const macGetSpace: AppInfo = {
  slug: "mac-get-space",
  fallbackIcon: HardDrive,
  // Cropped from the development build's Protection & exclusions screen, with the label burned in per language
  ogImage: { en: "/images/apps/mac-get-space/og.png", ko: "/images/apps/mac-get-space/og-ko.png" },
  supportEmail: SUPPORT_EMAIL,
  // Set to "/culture/storage-review/privacy.html" once mac-get-space's policy is published there
  privacyPolicyPath: undefined,
  schema: {
    type: "SoftwareApplication",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "macOS 14 or later",
  },
  content: {
    en: {
      name: "Mac Get Space",
      status: "Coming to the Mac App Store",
      tagline: "Free up your Mac, with your DAW projects, virtual instruments and plug-ins protected by default.",
      summary:
        "A storage cleaner that knows what a producer's Mac holds. Music production files that match its default protection rules are excluded from removal, and nothing is deleted until you approve a fixed plan.",
      highlights: [
        "Music Production protection rules are on by default",
        "Every item says why it's a candidate and whether it comes back",
        "Moves items to the Trash by default, then reports what actually changed",
        "Files and scan results are processed on your Mac, not uploaded",
      ],
      intro: [
        "If you make music, you know the feeling: the virtual instrument libraries you've installed keep filling up your disk.",
        "Mac Get Space is built for a musician's Mac. It finds the caches, installers and leftovers you can remove, explains why each one is safe to delete, and excludes the music production files its protection rules recognize.",
      ],
      screenshots: [
        {
          src: "/images/apps/mac-get-space/main.webp",
          width: 1440,
          height: 900,
          alt: "Mac Get Space's main window: cleanup candidates grouped by source with their class, size and status, and an inspector explaining why the selected cache is there and what removing it does",
          caption:
            "Each candidate shows why it's here and what removing it does. Every item inside the selected cache was inspected, and none is music, a preset or a project. The downloaded preset pack is marked Protected.",
          note: "Development build · sample data",
        },
        {
          src: "/images/apps/mac-get-space/protection.webp",
          width: 1440,
          height: 900,
          alt: "The Protection & exclusions screen with the Music Production profile on, listing rule groups for music production, audio plug-ins and vendor content, video originals, device backups, credentials and AI assistant data",
          caption: "The Music Production rules are on from the first scan. Protected items never get a checkbox.",
          note: "Development build · sample data",
        },
      ],
      sections: [
        {
          title: "What the protection rules cover",
          intro:
            "Music production files that match the default protection rules are excluded from removal. The rules recognize these formats and folders wherever the scan finds them, including inside caches, downloads, package folders and build products.",
          items: [
            { title: "Audio and stems", text: "WAV, AIFF, FLAC, MP3, M4A, CAF and the other audio formats the rules list." },
            {
              title: "Sample libraries and instruments",
              text: "Kontakt, EXS, SFZ and SoundFont files, REX loops and other sample library formats.",
            },
            { title: "Presets, patches and MIDI", text: "Plug-in presets and banks, SysEx dumps and MIDI files." },
            {
              title: "DAW projects",
              text: "Projects from Logic Pro, GarageBand, Cubase, Ableton Live, Pro Tools, FL Studio, Studio One, Bitwig Studio and Reaper.",
            },
            {
              title: "Plug-ins and vendor content",
              text: "VST, VST3, Audio Unit, AAX and CLAP plug-ins, and the content folders of sample and plug-in makers.",
            },
            {
              title: "Your music folders",
              text: "Your Music folder, ~/Library/Audio and /Library/Audio, your Splice folder, and any folder named after a DAW, a sound library or words like presets, stems, loops or sample packs.",
            },
          ],
          note: "Protected items never get a checkbox, and a folder that holds protected content can't be removed as a whole. One audio file inside a ZIP in a cache keeps the whole cache. ZIP and tar archives in your Downloads are listed before they are offered: a sample pack that holds audio, presets or projects stays, and an archive that can't be read is kept as not inspected. Video originals, device backups, credentials and AI assistant data are covered too.",
        },
        {
          title: "Where the rules stop",
          intro:
            "The rules are a strong default, not a guarantee. Check each item's reason before you approve a plan.",
          items: [
            {
              title: "Archives it can't open",
              text: "Inside a cache, ZIP-family archives are opened and checked. Other types, such as tar, gz, 7z, rar, dmg and pkg, aren't opened, so a cache that holds one is marked to review first: it is never recommended, but you can still select it yourself.",
            },
            {
              title: "Files the rules don't recognize",
              text: "Formats and folder names the rules don't list aren't protected by them. Add any folder you always want kept with Always Keep.",
            },
            {
              title: "Rules you turn off",
              text: "You can turn a rule off in Protection & exclusions. The app asks first, and the files that rule covered can then be selected.",
            },
          ],
        },
        {
          title: "How a cleanup works",
          style: "steps",
          items: [
            { title: "Scan", text: "Scanning only reads, and nothing is selected by default." },
            {
              title: "Review",
              text: "Each candidate says why it's there, what removing it does and whether it comes back. Re-creatable items, items to review first, personal files and protected items are kept apart.",
            },
            {
              title: "Approve a fixed plan",
              text: "The plan lists exactly what will be removed and how, and you confirm it with Touch ID or your login password.",
            },
            {
              title: "Remove and report",
              text: "Each item is checked again right before it is removed. Regular cleanup moves items to the Trash, and the report shows what actually changed; moving to the Trash frees no space until the Trash is emptied, and the app says so. Deleting items that are already in the Trash is permanent: the plan marks them for permanent deletion before you confirm it.",
            },
          ],
        },
        {
          title: "Free and Expert",
          items: [
            {
              title: "Free",
              text: "Moves browser and app caches, installers and updaters and development caches to the Trash, and can permanently delete the items already in your Trash. Shows the Expert items with their sizes, locked.",
            },
            {
              title: "Expert (in-app purchase)",
              text: "Adds more sources, such as project environments, Xcode build caches, GitHub Actions runner leftovers, Final Cut Pro render files and duplicate files in iCloud Drive (Archive) folders, plus permanent deletion instead of the Trash for any item, a deeper scan and duplicate verification.",
            },
          ],
          note: "Every safety feature is in both. None of them is part of the purchase.",
        },
        {
          title: "Privacy and requirements",
          items: [
            {
              title: "Your files are processed on your Mac",
              text: "Files and scan results are processed on your Mac and are not uploaded to our servers. The app has no analytics and no account. Apple handles Expert purchases and restores.",
            },
            {
              title: "macOS 14 or later",
              text: "On first launch it asks once for access to your home folder. Full Disk Access is optional and adds the Trash, device backups, Mail and Messages to the scan.",
            },
          ],
        },
      ],
      faq: [
        {
          question: "Will it delete my sample libraries, presets or projects?",
          answer:
            "Music production files that match the default protection rules are excluded from removal: audio, samples, presets, MIDI, DAW projects and plug-ins get no checkbox, and a folder that holds them can't be removed as a whole. The rules have limits. A cache that holds an archive type the app can't open is marked to review first and can still be selected by hand, and a rule you turn off stops protecting its files. Check each item's reason before you approve a plan.",
        },
        {
          question: "Does it delete anything on its own?",
          answer:
            "No. Scanning only reads, and nothing is selected by default. You approve a fixed plan with Touch ID or your login password, and each item is checked again right before it is removed.",
        },
        {
          question: "Does everything go to the Trash?",
          answer:
            "Regular cleanup moves items to the Trash by default. Deleting items that are already in the Trash is permanent, and the plan marks them that way before you confirm it. With Expert you can also choose permanent deletion instead of the Trash.",
        },
        {
          question: "What is the difference between Free and Expert?",
          answer:
            "Free moves browser and app caches, installers and development caches to the Trash and can permanently delete items already in your Trash; it shows Expert items with their sizes, locked. Expert, a one-time in-app purchase, adds more sources such as project environments, Xcode build caches and Final Cut Pro render files, plus permanent deletion instead of the Trash, a deeper scan and duplicate verification. The safety features are the same in both.",
        },
        {
          question: "Does it send anything about my files anywhere?",
          answer:
            "No. Files and scan results are processed on your Mac and are not uploaded to our servers. The app has no analytics and no account, and Apple handles Expert purchases and restores.",
        },
        {
          question: "What do I need to run it?",
          answer:
            "A Mac with macOS 14 or later. It asks once for access to your home folder, and Full Disk Access is optional.",
        },
        {
          question: "Can I get it now?",
          answer:
            "Not yet: it is being prepared for release. We are preparing its Mac App Store listing first, and this page will link to it once it is available.",
        },
      ],
      support: "Questions about Mac Get Space are welcome at {email}.",
    },
    ko: {
      name: "Mac Get Space",
      status: "Mac App Store 출시 예정",
      tagline: "DAW, 가상 악기 및 플러그인들은 기본으로 보호하면서 Mac 용량을 비웁니다.",
      summary:
        "프로듀서의 Mac에 무엇이 들어 있는지 아는 저장 공간 정리 앱입니다. 기본 보호 규칙에 해당하는 음악 작업 파일은 삭제 대상에서 제외하고, 고정된 삭제 계획을 직접 승인하기 전에는 아무것도 지우지 않습니다.",
      highlights: [
        "음악 제작(Music Production) 보호 규칙이 기본으로 켜져 있습니다",
        "항목마다 정리 후보가 된 이유와 다시 생기는지를 알려 줍니다",
        "기본으로 휴지통으로 옮기고, 실제로 바뀐 내용을 보고합니다",
        "파일과 검사 결과는 Mac에서 처리하며 업로드하지 않습니다",
      ],
      intro: [
        "음악을 하시다 보면 설치한 가상악기 라이브러리 등으로 인해 용량이 부족한 걸 느끼실 때가 많으실 겁니다.",
        "Mac Get Space는 음악가의 Mac을 위해 만들었습니다. 지워도 되는 캐시, 설치 파일, 남은 파일을 찾아 삭제해도 되는 이유를 설명하고, 보호 규칙이 알아보는 음악 작업 파일은 삭제 대상에서 제외합니다.",
      ],
      screenshots: [
        {
          src: "/images/apps/mac-get-space/main.webp",
          width: 1440,
          height: 900,
          alt: "Mac Get Space 메인 창: 출처별로 묶인 정리 후보와 각 항목의 분류, 크기, 상태, 그리고 선택한 캐시가 왜 후보인지와 지우면 어떻게 되는지 설명하는 인스펙터",
          caption:
            "후보마다 여기 있는 이유와 지우면 어떻게 되는지가 표시됩니다. 선택한 캐시는 안의 항목을 모두 검사해 음악, 프리셋, 프로젝트 파일이 없음을 확인했습니다. 내려받은 프리셋 팩은 보호 항목으로 표시됩니다.",
          note: "개발 중인 화면 · 예시 데이터",
        },
        {
          src: "/images/apps/mac-get-space/protection.webp",
          width: 1440,
          height: 900,
          alt: "보호 및 예외 화면: Music Production 프로필이 켜져 있고 음악 제작, 오디오 플러그인과 제조사 콘텐츠, 영상 원본, 기기 백업, 인증 정보, AI 어시스턴트 데이터 규칙이 보입니다",
          caption: "음악 제작 보호 규칙은 첫 검사부터 켜져 있습니다. 보호 항목에는 체크박스가 없습니다.",
          note: "개발 중인 화면 · 예시 데이터",
        },
      ],
      sections: [
        {
          title: "보호 규칙이 지키는 것",
          intro:
            "기본 보호 규칙에 해당하는 음악 작업 파일은 삭제 대상에서 제외합니다. 규칙은 아래 형식과 폴더를 검사 중 어디에서 찾든 알아보며, 캐시, 다운로드, 패키지 폴더, 빌드 결과물 안도 마찬가지입니다.",
          items: [
            { title: "오디오와 스템", text: "WAV, AIFF, FLAC, MP3, M4A, CAF 등 규칙에 등록된 오디오 형식." },
            {
              title: "샘플 라이브러리와 악기",
              text: "Kontakt, EXS, SFZ, SoundFont 파일, REX 루프 등 샘플 라이브러리 형식.",
            },
            { title: "프리셋, 패치, MIDI", text: "플러그인 프리셋과 뱅크, SysEx 덤프, MIDI 파일." },
            {
              title: "DAW 프로젝트",
              text: "Logic Pro, GarageBand, Cubase, Ableton Live, Pro Tools, FL Studio, Studio One, Bitwig Studio, Reaper 프로젝트.",
            },
            {
              title: "플러그인과 제조사 콘텐츠",
              text: "VST, VST3, Audio Unit, AAX, CLAP 플러그인과 샘플·플러그인 제조사의 콘텐츠 폴더.",
            },
            {
              title: "음악 폴더",
              text: "홈 폴더의 음악 폴더, ~/Library/Audio와 /Library/Audio, Splice 폴더, 그리고 DAW나 음원 라이브러리 이름, presets·stems·loops·sample packs 같은 이름이 붙은 폴더.",
            },
          ],
          note: "보호 항목에는 체크박스가 없고, 보호 항목이 든 폴더는 통째로 지울 수 없습니다. 캐시 안의 ZIP 파일에 오디오 파일이 하나만 있어도 그 캐시는 통째로 남습니다. 다운로드 폴더의 ZIP과 tar 압축 파일은 후보로 올리기 전에 안의 목록을 확인해, 오디오, 프리셋, 프로젝트가 든 샘플 팩은 그대로 두고 읽을 수 없는 압축 파일은 검사하지 않은 항목으로 남깁니다. 영상 원본, 기기 백업, 인증 정보, AI 어시스턴트 데이터도 규칙에 포함됩니다.",
        },
        {
          title: "보호 규칙의 한계",
          intro: "보호 규칙은 강한 기본값이지만 모든 경우를 보장하지는 않습니다. 계획을 승인하기 전에 항목마다 이유를 확인하세요.",
          items: [
            {
              title: "열어 보지 못하는 압축 파일",
              text: "캐시 안의 ZIP 계열 압축 파일은 열어서 검사합니다. tar, gz, 7z, rar, dmg, pkg 같은 다른 형식은 열지 않으므로, 이런 파일이 든 캐시는 먼저 검토할 항목으로 표시됩니다. 추천되지는 않지만 직접 선택할 수는 있습니다.",
            },
            {
              title: "규칙이 모르는 파일",
              text: "규칙에 없는 형식이나 폴더 이름은 보호되지 않습니다. 항상 남겨야 하는 폴더는 항상 유지(Always Keep)에 추가하세요.",
            },
            {
              title: "직접 끈 규칙",
              text: "보호 및 예외(Protection & exclusions)에서 규칙을 끌 수 있습니다. 앱이 먼저 확인을 요청하며, 끈 뒤에는 그 규칙이 지키던 파일도 선택할 수 있게 됩니다.",
            },
          ],
        },
        {
          title: "정리는 이렇게 진행됩니다",
          style: "steps",
          items: [
            { title: "검사", text: "검사는 읽기만 하고, 처음에는 아무것도 선택되어 있지 않습니다." },
            {
              title: "검토",
              text: "후보마다 여기 있는 이유, 지우면 어떻게 되는지, 다시 생기는지가 적혀 있습니다. 다시 만들어지는 항목, 먼저 검토할 항목, 개인 파일, 보호 항목을 나눠 보여 줍니다.",
            },
            {
              title: "고정된 계획 승인",
              text: "무엇을 어떻게 지울지 정확히 나열된 계획을 Touch ID나 로그인 암호로 승인합니다.",
            },
            {
              title: "삭제와 보고",
              text: "지우기 직전에 항목마다 다시 확인합니다. 일반 정리는 항목을 휴지통으로 옮기고, 실제로 바뀐 내용을 보고합니다. 휴지통을 비우기 전에는 공간이 늘지 않는다는 것도 알려 줍니다. 이미 휴지통에 있는 항목을 지우는 것은 영구 삭제이며, 승인하기 전에 계획에 영구 삭제로 표시됩니다.",
            },
          ],
        },
        {
          title: "무료와 Expert",
          items: [
            {
              title: "무료",
              text: "브라우저와 앱 캐시, 설치 파일과 업데이터, 개발 캐시를 휴지통으로 옮기고, 이미 휴지통에 있는 항목은 영구 삭제할 수 있습니다. Expert 항목은 크기와 함께 잠긴 채로 보여 줍니다.",
            },
            {
              title: "Expert (인앱 결제)",
              text: "프로젝트 환경, Xcode 빌드 캐시, GitHub Actions 러너 잔여물, Final Cut Pro 렌더 파일, iCloud 보관 폴더의 중복 파일 같은 항목을 더하고, 휴지통을 거치지 않는 영구 삭제, 심층 검사, 중복 검증을 엽니다.",
            },
          ],
          note: "안전 기능은 두 버전에 모두 들어 있습니다. 구매해야 쓸 수 있는 안전 기능은 없습니다.",
        },
        {
          title: "개인정보와 사용 환경",
          items: [
            {
              title: "파일은 Mac에서 처리합니다",
              text: "파일과 검사 결과는 Mac에서 처리하며 개발자 서버로 업로드하지 않습니다. 분석 도구도 계정도 없습니다. Expert 구매와 복원은 Apple이 처리합니다.",
            },
            {
              title: "macOS 14 이상",
              text: "처음 실행할 때 홈 폴더 접근을 한 번 요청합니다. 전체 디스크 접근 권한은 선택 사항이며, 허용하면 휴지통, 기기 백업, 메일, 메시지도 검사합니다.",
            },
          ],
        },
      ],
      faq: [
        {
          question: "샘플 라이브러리, 프리셋, 프로젝트가 지워지지는 않나요?",
          answer:
            "기본 보호 규칙에 해당하는 음악 작업 파일은 삭제 대상에서 제외합니다. 오디오, 샘플, 프리셋, MIDI, DAW 프로젝트, 플러그인에는 체크박스가 없고, 이런 파일이 든 폴더는 통째로 지울 수 없습니다. 다만 한계가 있습니다. 열어 보지 못하는 형식의 압축 파일이 든 캐시는 먼저 검토할 항목으로 표시되어 직접 선택할 수 있고, 끈 규칙은 더 이상 파일을 보호하지 않습니다. 계획을 승인하기 전에 항목마다 이유를 확인하세요.",
        },
        {
          question: "앱이 알아서 지우는 것이 있나요?",
          answer:
            "없습니다. 검사는 읽기만 하고, 처음에는 아무것도 선택되어 있지 않습니다. 고정된 계획을 Touch ID나 로그인 암호로 승인해야 하고, 지우기 직전에 항목마다 다시 확인합니다.",
        },
        {
          question: "모든 항목이 휴지통으로 가나요?",
          answer:
            "일반 정리는 기본적으로 휴지통으로 이동합니다. 이미 휴지통에 있는 항목을 지우는 것은 영구 삭제이며, 승인하기 전에 계획에 영구 삭제로 표시됩니다. Expert에서는 휴지통 대신 영구 삭제를 고를 수도 있습니다.",
        },
        {
          question: "무료 버전과 Expert는 무엇이 다른가요?",
          answer:
            "무료 버전은 브라우저와 앱 캐시, 설치 파일, 개발 캐시를 휴지통으로 옮기고 이미 휴지통에 있는 항목은 영구 삭제할 수 있으며, Expert 항목은 크기와 함께 잠긴 채로 보여 줍니다. 한 번 구매하는 앱 내 구입인 Expert는 프로젝트 환경, Xcode 빌드 캐시, Final Cut Pro 렌더 파일 같은 항목과 휴지통을 거치지 않는 영구 삭제, 심층 검사, 중복 검증을 더합니다. 안전 기능은 두 버전이 같습니다.",
        },
        {
          question: "파일에 관한 정보를 어딘가로 보내나요?",
          answer:
            "아니요. 파일과 검사 결과는 Mac에서 처리하며 개발자 서버로 업로드하지 않습니다. 분석 도구도 계정도 없고, Expert 구매와 복원은 Apple이 처리합니다.",
        },
        {
          question: "어떤 Mac에서 쓸 수 있나요?",
          answer:
            "macOS 14 이상의 Mac에서 쓸 수 있습니다. 처음에 홈 폴더 접근을 한 번 요청하며, 전체 디스크 접근 권한은 선택 사항입니다.",
        },
        {
          question: "지금 받을 수 있나요?",
          answer:
            "현재는 출시 준비중입니다. 우선 Mac App Store 등록을 준비하고 있으며, 출시되면 이 페이지에 링크를 걸어 두겠습니다.",
        },
      ],
      support: "Mac Get Space에 관한 질문은 {email}로 보내 주세요.",
    },
  },
};

export const APPS: Record<AppSlug, AppInfo> = {
  "chord-to-midi": chordToMidi,
  "mac-get-space": macGetSpace,
};

/** The homepage's Apps section */
export const APPS_SECTION: Record<SupportedLanguage, { title: string; intro: string; learnMore: string }> = {
  en: {
    title: "Apps for Musicians",
    intro: "Made in our studio for songwriters, producers and arrangers.",
    learnMore: "Learn more",
  },
  ko: {
    title: "음악가를 위한 앱",
    intro: "작곡가, 프로듀서, 편곡자를 위해 저희 스튜디오에서 만듭니다.",
    learnMore: "자세히 보기",
  },
};

/** Labels around the content of an app page */
export const APP_PAGE_LABELS: Record<
  SupportedLanguage,
  {
    breadcrumb: string;
    home: string;
    faq: string;
    support: string;
    privacyPolicy: string;
    moreApps: string;
    learnMore: string;
    studioTitle: string;
    studioText: string;
    studioLink: string;
  }
> = {
  en: {
    breadcrumb: "Breadcrumb",
    home: "Culture & Tech",
    faq: "Frequently asked questions",
    support: "Support",
    privacyPolicy: "Privacy policy",
    moreApps: "More apps for musicians",
    learnMore: "Learn more",
    studioTitle: "From the same studio",
    studioText: "Culture & Tech also writes and produces original songs for Live-idols.",
    studioLink: "Hear our Live-idol works",
  },
  ko: {
    breadcrumb: "현재 위치",
    home: "컬처앤테크",
    faq: "자주 묻는 질문",
    support: "문의",
    privacyPolicy: "개인정보 처리방침",
    moreApps: "음악가를 위한 다른 앱",
    learnMore: "자세히 보기",
    studioTitle: "같은 스튜디오에서",
    studioText: "컬처앤테크는 라이브아이돌 오리지널곡도 만들고 있습니다.",
    studioLink: "라이브아이돌 작업 듣기",
  },
};
