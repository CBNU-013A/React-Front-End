import React from "react";
import { Link } from "react-router-dom";

const LoginModal = ({
  isOpen,
  onClose,
  title = "로그인이 필요합니다",
  message = "이 기능을 사용하려면 로그인해주세요.",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-600 text-lg">{message}</p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              취소
            </button>
            <Link
              to="/login"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-center transition-colors"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
