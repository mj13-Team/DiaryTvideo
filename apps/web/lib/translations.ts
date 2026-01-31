import { Language } from "@repo/types";

export const COOMON_TRANSLATIONS = {
  project_name: "DiaryTvideo",
  allRightsReserved: "All rights reserved",
  developedBy: "Developed by",
  poweredBy: "Powered by",
  contact: "Contact",
};

export const translations: { [key in Language]: { [key: string]: string } } = {
  en: {
    // Navigation
    project_name: COOMON_TRANSLATIONS.project_name,
    signIn: "Sign In",
    getStarted: "Get Started",
    newEntry: "New Entry",
    logout: "Logout",

    // Intro Page
    heroTitle: "Your Personal Space for",
    heroSubtitle: "Thoughts & Memories",
    heroDescription:
      "Capture your daily moments, reflect on your journey, and preserve your memories in a beautiful, private digital diary that's always with you.",
    startWritingToday: "Start Writing Today",
    alreadyHaveAccount: "I Already Have an Account",
    whyDigitalDiary: "Why Keep a Digital Diary?",
    easyWriting: "Easy Writing",
    easyWritingDesc:
      "Simple, distraction-free interface that lets you focus on what matters - your thoughts.",
    privateSecure: "Private & Secure",
    privateSecureDesc:
      "Your entries are personal. Keep your memories safe and accessible only to you.",
    aiVideoView: "AI Video View",
    aiVideoViewDesc:
      "View your diary entries as engaging video summaries or traditional text format.",
    readyToStart: "Ready to Start Your Journey?",
    joinThousands: "Join thousands who have made journaling a daily habit.",
    createFreeDiary: "Create Your Free Diary",
    allRightsReserved: COOMON_TRANSLATIONS.allRightsReserved,

    // Login Page
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    signInToContinue: "Sign in to continue your journaling journey",
    startYourDiaryToday: "Start your personal diary today",
    alreayAccount: "I Already Have an Account",
    notyetAccount: "Don't have an account?",

    // Verification Page
    verifyEmail: "Verify Email",
    enterVerificationCode: "Enter verification code",
    verificationCodeSent: "Verification code sent to your email",
    didntReceiveCode: "Didn't receive the code?",
    resendCode: "Resend code",
    verifyAndContinue: "Verify and continue",
    codeExpired: "Verification code has expired",
    invalidCode: "Invalid verification code",
    emailVerificationRequired:
      "Email verification is required. Redirecting to verification page.",

    // Password Reset Page
    forgotPassword: "Forgot your password?",
    resetPassword: "Reset Password",
    enterEmailForReset:
      "Enter your email address to receive a password reset link",
    sendResetLink: "Send Reset Link",
    passwordResetEmailSentTo: "Password reset link has been sent to:",
    resendAvailableIn: "You can resend in {seconds} seconds",
    didntReceiveEmail: "Didn't receive the email?",
    resendEmail: "Resend email",
    verificationCodeResent: "Verification code has been resent!",
    passwordResetEmailResent: "Password reset email has been resent!",
    enterNewPassword: "Enter your new password",
    confirmPassword: "Confirm Password",
    resetPasswordButton: "Reset Password",
    goToLogin: "Go to Login",

    // Password Reset Errors
    invalidAccess: "Invalid Access",
    invalidAccessDesc: "This page requires a valid reset token",
    linkExpired: "Link Expired",
    linkExpiredDesc: "This reset link has expired",
    invalidLink: "Invalid Link",
    invalidLinkDesc: "This reset link is invalid",
    linkAlreadyUsed: "Link Already Used",
    linkAlreadyUsedDesc: "This reset link has already been used",
    requestNewLink: "Request New Link",

    // Diary Page
    newEntryTitle: "Title",
    newEntryDescription: "Write your thoughts",
    cancel: "Cancel",
    saveEntry: "Save Entry",
    newEntryTitlePlaceholder: "Give your entry a title...",
    newEntryDescriptionPlaceholder: "What's on your mind today...",
    noEntriesYet: "No Entries Yet",
    startWritingFirst: "Start writing your first diary entry now!",
    entry: "entry",
    entries: "entries",
    filtered: "filtered",
    noEntriesMatch: "No entries match your criteria.",
    clearAllFilters: "Clear All Filters",
    failedToLoadEntries: "Failed to load entries",
    tryAgain: "Try again",
    deleteEntryTitle: "Delete Entry",
    deleteEntryMessage:
      "Are you sure you want to delete this entry? This action cannot be undone.",
    deleteConfirm: "Delete",

    // Account Page
    account: "Account",
    accountSettings: "Account Settings",
    userInformation: "User Information",
    name: "Name",
    email: "Email",
    memberSince: "Member Since",
    changeName: "Change Name",
    newName: "New Name",
    updateName: "Update Name",
    nameUpdated: "Name updated successfully",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    passwordUpdated: "Password updated successfully",
    passwordsDoNotMatch: "Passwords do not match",
    passwordUppercaseRequired:
      "Password must contain at least one uppercase letter",
    cancelMembership: "Cancel Membership",
    cancelMembershipWarning:
      "This action will permanently delete your account and all your diary entries. This cannot be undone.",
    deleteAccount: "Delete Account",
    accountDeleted: "Account deleted successfully",
    backToDiary: "Back to Diary",

    // Footer
    developedBy: COOMON_TRANSLATIONS.developedBy,
    poweredBy: COOMON_TRANSLATIONS.poweredBy,
    contact: COOMON_TRANSLATIONS.contact,

    // Video Status
    videoStatusPending: "Pending",
    videoStatusProcessing: "Generating",
    videoStatusCompleted: "AI Generated",
    videoStatusFailed: "Failed",
    videoStatusPendingTitle: "Waiting to generate video",
    videoStatusPendingSubtitle: "Please wait a moment",
    videoStatusProcessingTitle: "Generating your video",
    videoStatusProcessingSubtitle: "We'll let you know when it's done",
    videoStatusFailedTitle: "Video generation failed",
    videoStatusRetry: "Retry",
  },
  ko: {
    // Navigation
    project_name: COOMON_TRANSLATIONS.project_name,
    signIn: "로그인",
    getStarted: "시작하기",
    newEntry: "새 일기",
    logout: "로그아웃",

    // Intro Page
    heroTitle: "당신만의 공간",
    heroSubtitle: "생각과 추억을 위한",
    heroDescription:
      "일상의 순간을 기록하고, 여정을 돌아보며, 아름답고 안전한 디지털 일기장에 소중한 기억을 보관하세요.",
    startWritingToday: "지금 시작하기",
    alreadyHaveAccount: "이미 계정이 있습니다",
    whyDigitalDiary: "디지털 일기장의 장점",
    easyWriting: "간편한 작성",
    easyWritingDesc:
      "중요한 것에 집중할 수 있도록 방해 요소 없는 간단한 인터페이스를 제공합니다.",
    privateSecure: "개인정보 보호",
    privateSecureDesc:
      "당신의 일기는 개인적입니다. 안전하게 보관되며 오직 당신만 접근할 수 있습니다.",
    aiVideoView: "AI 비디오 뷰",
    aiVideoViewDesc:
      "일기를 영상 요약 형식이나 전통적인 텍스트 형식으로 볼 수 있습니다.",
    readyToStart: "여정을 시작할 준비가 되셨나요?",
    joinThousands: "일기 쓰기를 일상으로 만든 수천 명과 함께하세요.",
    createFreeDiary: "무료 일기장 만들기",
    allRightsReserved: COOMON_TRANSLATIONS.allRightsReserved,

    // Login Page
    welcomeBack: "다시 오신 것을 환영합니다",
    createAccount: "계정 만들기",
    signInToContinue: "일기 여정을 계속하려면 로그인하세요",
    startYourDiaryToday: "지금 개인 일기장을 시작하세요",
    alreayAccount: "이미 계정이 있습니다",
    notyetAccount: "계정이 없으신가요?",

    // Verification Page
    verifyEmail: "이메일 인증",
    enterVerificationCode: "인증 코드를 입력하세요",
    verificationCodeSent: "인증 코드가 이메일로 전송되었습니다",
    didntReceiveCode: "이메일을 받지 못하셨나요?",
    resendCode: "코드 재전송",
    verifyAndContinue: "인증하고 계속하기",
    codeExpired: "인증 코드가 만료되었습니다",
    invalidCode: "올바르지 않은 코드입니다",
    emailVerificationRequired:
      "이메일 인증이 필요합니다. 인증 페이지로 이동합니다.",

    // Password Reset Page
    forgotPassword: "비밀번호를 잊으셨나요?",
    resetPassword: "비밀번호 재설정",
    enterEmailForReset: "비밀번호 재설정 링크를 받을 이메일 주소를 입력하세요",
    sendResetLink: "재설정 링크 전송",
    passwordResetEmailSentTo: "비밀번호 재설정 링크가 전송되었습니다:",
    resendAvailableIn: "{seconds}초 후에 재전송할 수 있습니다",
    didntReceiveEmail: "이메일을 받지 못하셨나요?",
    resendEmail: "이메일 재전송",
    verificationCodeResent: "인증 코드가 재전송되었습니다!",
    passwordResetEmailResent: "비밀번호 재설정 이메일이 재전송되었습니다!",
    enterNewPassword: "새로운 비밀번호를 입력해주세요",
    confirmPassword: "비밀번호 확인",
    resetPasswordButton: "비밀번호 변경",
    goToLogin: "로그인으로 이동",

    // Password Reset Errors
    invalidAccess: "잘못된 접근",
    invalidAccessDesc: "유효한 재설정 토큰이 필요합니다",
    linkExpired: "링크 만료",
    linkExpiredDesc: "재설정 링크가 만료되었습니다",
    invalidLink: "유효하지 않은 링크",
    invalidLinkDesc: "유효하지 않은 재설정 링크입니다",
    linkAlreadyUsed: "이미 사용된 링크",
    linkAlreadyUsedDesc: "이미 사용된 재설정 링크입니다",
    requestNewLink: "새 링크 요청",

    // Diary Page
    newEntryTitle: "제목",
    newEntryDescription: "생각을 적어보세요",
    cancel: "취소",
    saveEntry: "저장",
    newEntryTitlePlaceholder: "일기의 제목을 입력하세요.",
    newEntryDescriptionPlaceholder: "오늘의 생각은 무엇인가요.",
    noEntriesYet: "아직 작성된 일기가 없습니다",
    startWritingFirst: "지금 바로 첫 일기를 작성해보세요!",
    entry: "개",
    entries: "개",
    filtered: "필터링됨",
    noEntriesMatch: "조건에 맞는 일기가 없습니다.",
    clearAllFilters: "모든 필터 지우기",
    failedToLoadEntries: "일기를 불러올 수 없습니다",
    tryAgain: "다시 시도",
    deleteEntryTitle: "일기 삭제",
    deleteEntryMessage:
      "정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    deleteConfirm: "삭제",

    // Account Page
    account: "계정",
    accountSettings: "계정 설정",
    userInformation: "사용자 정보",
    name: "이름",
    email: "이메일",
    memberSince: "가입일",
    changeName: "이름 변경",
    newName: "새 이름",
    updateName: "이름 업데이트",
    nameUpdated: "이름이 성공적으로 업데이트되었습니다",
    changePassword: "비밀번호 변경",
    currentPassword: "현재 비밀번호",
    newPassword: "새 비밀번호",
    confirmNewPassword: "새 비밀번호 확인",
    updatePassword: "비밀번호 업데이트",
    passwordUpdated: "비밀번호가 성공적으로 업데이트되었습니다",
    passwordsDoNotMatch: "비밀번호가 일치하지 않습니다",
    passwordUppercaseRequired: "비밀번호에 대문자가 최소 1개 포함되어야 합니다",
    cancelMembership: "회원 탈퇴",
    cancelMembershipWarning:
      "이 작업은 계정과 모든 일기를 영구적으로 삭제합니다. 되돌릴 수 없습니다.",
    deleteAccount: "계정 삭제",
    accountDeleted: "계정이 성공적으로 삭제되었습니다",
    backToDiary: "일기장으로 돌아가기",

    // Footer
    developedBy: COOMON_TRANSLATIONS.developedBy,
    poweredBy: COOMON_TRANSLATIONS.poweredBy,
    contact: COOMON_TRANSLATIONS.contact,

    // Video Status
    videoStatusPending: "대기 중",
    videoStatusProcessing: "생성 중",
    videoStatusCompleted: "AI 생성됨",
    videoStatusFailed: "실패",
    videoStatusPendingTitle: "영상을 생성하기 위해 대기 중입니다",
    videoStatusPendingSubtitle: "잠시만 기다려 주세요",
    videoStatusProcessingTitle: "영상을 생성하고 있습니다",
    videoStatusProcessingSubtitle: "완료되면 알려드릴게요",
    videoStatusFailedTitle: "영상 생성에 실패했습니다",
    videoStatusRetry: "다시 시도",
  },
} as const;
