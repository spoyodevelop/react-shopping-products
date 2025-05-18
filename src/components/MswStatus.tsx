import React from "react";

const MswStatus: React.FC = () => {
  const isMswEnabled = import.meta.env.VITE_APP_USE_MSW;
  const env = import.meta.env.MODE;

  if (env === "production" && !isMswEnabled) {
    return null; // 프로덕션 환경에서 MSW가 비활성화된 경우 아무것도 표시하지 않음
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        backgroundColor: isMswEnabled ? "#4CAF50" : "#F44336",
        color: "white",
        zIndex: 9999,
      }}
    >
      {isMswEnabled
        ? "MSW 활성화 (모의 API 사용 중)"
        : "MSW 비활성화 (실제 API 사용 중)"}
    </div>
  );
};

export default MswStatus;
