"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { LogIn } from 'lucide-react';
import Image from 'next/image'; // Image 컴포넌트 임포트

const LoginPage = () => {
  const handleKakaoLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/kakao`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            로그인
          </h1>
        </div>
        <p className="text-lg text-slate-600 mb-8">
          21일 챌린지를 시작하려면 카카오 계정으로 로그인해주세요.
        </p>
        <Button
          onClick={handleKakaoLogin}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center"
        >
          <Image src="/kakao_logo.svg" alt="Kakao Logo" className="w-5 h-5 mr-2" width={20} height={20} />
          카카오 로그인
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
