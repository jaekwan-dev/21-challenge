"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { useUser } from '@/context/UserContext';

const LoginSuccessPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useUser(); // useUser 훅 사용

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(`http://localhost:8080/auth/user-details/${userIdParam}`);
          if (!response.ok) {
            throw new Error('사용자 정보를 가져오는데 실패했습니다.');
          }
          const userData = await response.json();
          // UserContext에 저장할 User 객체 형식에 맞게 변환
          const formattedUser = {
            id: userData.kakaoId,
            nickname: userData.nickname,
            email: userData.email,
            profile_image: userData.profilePictureUrl,
          };
          setUser(formattedUser); // UserContext 업데이트
          localStorage.setItem('user', JSON.stringify(formattedUser)); // localStorage에 사용자 정보 저장
          router.push('/challenges'); // 챌린지 페이지로 이동
        } catch (error) {
          console.error('사용자 정보 가져오기 실패:', error);
          router.push('/login'); // 오류 발생 시 로그인 페이지로 리디렉션
        }
      };
      fetchUserDetails();
    } else {
      console.error('userId 파라미터가 없습니다.');
      router.push('/login'); // userId가 없으면 로그인 페이지로 리디렉션
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-600 mr-2" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            로그인 성공!
          </h1>
        </div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          잠시 후 챌린지 페이지로 이동합니다...
        </p>
      </div>
    </div>
  );
};

const LoginSuccessPage = () => {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LoginSuccessPageContent />
    </Suspense>
  );
};

export default LoginSuccessPage;
