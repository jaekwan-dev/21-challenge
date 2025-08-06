"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Sparkles, Droplets, Dumbbell, BookOpen, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from '@/context/UserContext';

interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string; // string으로 변경
  color: string;
  bgGradient: string;
  duration: string;
  difficulty: string;
}

// 아이콘 매핑 객체
const IconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Droplets: Droplets,
  Dumbbell: Dumbbell,
  BookOpen: BookOpen,
  Sparkles: Sparkles,
  Code: Code,
  // 필요한 다른 아이콘들을 여기에 추가
};

const ChallengeDetailPage = () => {
  const params = useParams();
  const challengeId = Number(params.id);
  const { user } = useUser(); // useUser 훅 사용
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [dailyStatus, setDailyStatus] = useState<boolean[]>([]); // 21일간의 성공 여부
  const [completedDays, setCompletedDays] = useState(0); // 완료된 날짜 수
  const [startDate, setStartDate] = useState<string | null>(null); // 챌린지 시작 날짜
  const [communityStatus, setCommunityStatus] = useState<{ nickname: string; completionRate: number; profilePictureUrl?: string }[]>([]);

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/challenges/${challengeId}`);
        if (!response.ok) {
          throw new Error('챌린지 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setChallenge(data);
      } catch (error) {
        console.error('챌린지 정보 가져오기 실패:', error);
        setChallenge(null); // 챌린지 정보를 가져오지 못하면 null로 설정
      }
    };

    const fetchUserChallengeStatus = async () => {
      if (!user?.id) return; // 사용자 ID가 없으면 요청하지 않음

      try {
        const response = await fetch(`http://localhost:8080/challenges/${challengeId}/user-status/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setDailyStatus(data.dailyStatus);
          setCompletedDays(data.dailyStatus.filter(Boolean).length);
          setStartDate(data.startDate.split('T')[0]); // YYYY-MM-DD 형식으로 저장
        } else if (response.status === 404) {
          // 사용자의 챌린지 기록이 없는 경우 (새로운 챌린지 시작)
          const today = new Date();
          const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
          const initialDailyStatus = new Array(21).fill(false);
          setDailyStatus(initialDailyStatus);
          setCompletedDays(0);
          setStartDate(todayString);
          // 초기 상태를 백엔드에 저장
          updateChallengeStatusBackend(initialDailyStatus, user.id, todayString);
        } else {
          throw new Error('사용자 챌린지 현황을 가져오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('사용자 챌린지 현황 가져오기 실패:', error);
      }
    };

    fetchChallengeDetails();
    fetchUserChallengeStatus();
    fetchCommunityStatus(); // 컴포넌트 마운트 시 커뮤니티 현황 가져오기
  }, [challengeId, user?.id]); // user.id를 의존성 배열에 추가

  useEffect(() => {
    // 일일 진행 상황이 변경될 때마다 백엔드에 업데이트
    if (user?.id && startDate) { // user.id와 startDate가 있을 때만 백엔드에 업데이트
      updateChallengeStatusBackend(dailyStatus, user.id, startDate);
    }
  }, [dailyStatus, challengeId, user?.id, startDate]);

  const updateChallengeStatusBackend = async (status: boolean[], currentUserId: string, currentStartDate: string) => {
    try {
      await fetch(`http://localhost:8080/challenges/${challengeId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId, dailyStatus: status, startDate: currentStartDate }),
      });
      console.log('챌린지 현황이 백엔드에 업데이트되었습니다.');
    } catch (error) {
      console.error('챌린지 현황 업데이트 실패:', error);
    }
  };

  const fetchCommunityStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8080/challenges/${challengeId}/community-status`);
      const data = await response.json();
      setCommunityStatus(data);
    } catch (error) {
      console.error('커뮤니티 현황 가져오기 실패:', error);
    }
  };

  const handleDayClick = (dayIndex: number) => {
    if (!startDate) return; // startDate가 없으면 아무것도 하지 않음

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 0으로 설정하여 날짜만 비교

    const challengeDayDate = new Date(startDate);
    challengeDayDate.setDate(challengeDayDate.getDate() + dayIndex);
    challengeDayDate.setHours(0, 0, 0, 0); // 시간을 0으로 설정하여 날짜만 비교

    // 챌린지 날짜가 오늘보다 미래인 경우 클릭 비활성화
    if (challengeDayDate > today) {
      alert("미래 날짜는 체크할 수 없습니다.");
      return;
    }

    setDailyStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[dayIndex] = !newStatus[dayIndex]; // 상태 토글
      return newStatus;
    });
  };

  const getFormattedDate = (dayIndex: number) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + dayIndex); // Day 1은 시작 날짜, Day 2는 시작 날짜 + 1일
    const month = start.getMonth() + 1;
    const day = start.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[start.getDay()];
    return `${month}/${day} (${weekday})`;
  };

  const handleCompleteChallenge = () => {
    alert("축하합니다! 챌린지를 성공적으로 완료하셨습니다!");
    // TODO: 챌린지 완료 후 추가적인 로직 (예: 서버에 완료 기록, 배지 부여 등)
  };

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-slate-600">챌린지를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const IconComponent = IconMap[challenge.icon] || Sparkles; // 매핑된 아이콘 또는 기본 아이콘

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* User Profile Section */}
        {user && (
          <div className="flex items-center justify-end mb-8">
            {user.profile_image && (
              <img
                src={user.profile_image}
                alt="User Profile"
                className="w-10 h-10 rounded-full mr-3 border-2 border-purple-400"
              />
            )}
            <span className="text-lg font-semibold text-slate-700">{user.nickname || '사용자'}</span>
          </div>
        )}

        {/* Challenge Header */} 
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <IconComponent className={`w-10 h-10 ${challenge.color} mr-3`} />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {challenge.title}
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {challenge.description}
          </p>
          <div className="flex justify-center gap-4 mt-4">
          </div>
          <div className="mt-8 text-xl font-semibold text-slate-700">
            현재 진행률: {completedDays} / 21일
          </div>
        </div>

        {/* Daily Tracking Grid */} 
        <div className="grid grid-cols-7 gap-2 max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-xl">
          {/* Weekday Headers */}
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-500 text-sm py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {(() => {
            if (!startDate) return null;
            const startDayOfWeek = new Date(startDate).getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
            const emptyCells = Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ));

            return (
              <>
                {emptyCells}
                {Array.from({ length: 21 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-all duration-200
                      ${dailyStatus[index] ? 'bg-green-100' : 'bg-gray-50'}
                      hover:bg-gray-100`}
                  >
                    <span className="text-xs text-gray-600">Day {index + 1}</span>
                    <span className="text-sm font-medium text-gray-800">{getFormattedDate(index)}</span>
                    <Button
                      variant={dailyStatus[index] ? 'default' : 'outline'}
                      size="sm"
                      className={`mt-2 w-full ${dailyStatus[index] ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => handleDayClick(index)}
                      disabled={(() => {
                        if (!startDate) return true;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const challengeDayDate = new Date(startDate);
                        challengeDayDate.setDate(challengeDayDate.getDate() + index);
                        challengeDayDate.setHours(0, 0, 0, 0);
                        return challengeDayDate.getTime() !== today.getTime(); // 오늘 날짜가 아니면 비활성화
                      })()}
                    >
                      {dailyStatus[index] ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1 text-gray-400" />
                      )}
                      {dailyStatus[index] ? '완료' : '체크'}
                    </Button>
                  </div>
                ))}
              </>
            );
          })()}
        </div>

        {/* Community Status */} 
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">다른 참여자들의 현황</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityStatus.map((user, index) => (
              <Card key={index} className="p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="font-medium text-slate-700">{user.nickname}</span>
                </div>
                <Badge variant="secondary" className="text-base">
                  {user.completionRate}%
                </Badge>
              </Card>
            ))}
          </div>
        </div>

        {/* Complete Challenge Button */} 
        {completedDays === 21 && (
          <div className="text-center mt-12">
            <Button
              onClick={handleCompleteChallenge}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-lg"
            >
              챌린지 완료하기 🎉
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
