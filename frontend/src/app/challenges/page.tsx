"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image'; // Image 컴포넌트 임포트
import { Droplets, Dumbbell, BookOpen, ArrowRight, Sparkles, Users } from 'lucide-react';

interface Participant {
  nickname: string;
  profilePictureUrl?: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  duration: string;
  difficulty: string;
  _count: { userChallenges: number }; // 참여자 수
  participantsPreview: Participant[]; // 미리보기 참여자
}

// 아이콘 매핑 객체
const IconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Droplets: Droplets,
  Dumbbell: Dumbbell,
  BookOpen: BookOpen,
  Sparkles: Sparkles,
  // 필요한 다른 아이콘들을 여기에 추가
};

const ChallengesPage = () => {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showParticipantsPopup, setShowParticipantsPopup] = useState(false);
  const [participantsPopupData, setParticipantsPopupData] = useState<{ challengeTitle: string; participants: Participant[] } | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges`);
        const data = await response.json();
        setChallenges(data);
      } catch (error) {
        console.error('챌린지 목록을 가져오는데 실패했습니다:', error);
      }
    };
    fetchChallenges();
  }, []);

  const handleSelectChallenge = (challengeId: number) => {
    router.push(`/challenges/${challengeId}`);
  };

  const fetchParticipants = async (challengeId: number, challengeTitle: string, event: React.MouseEvent) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges/${challengeId}/participants`);
      const data = await response.json();
      setParticipantsPopupData({ challengeTitle, participants: data });
      setPopupPosition({ x: event.clientX, y: event.clientY });
      setShowParticipantsPopup(true);
    } catch (error) {
      console.error('참여자 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const closeParticipantsPopup = () => {
    setShowParticipantsPopup(false);
    setParticipantsPopupData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 mr-2" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              챌린지 선택
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            21일간의 여정을 통해 새로운 습관을 만들고 더 나은 자신으로 성장해보세요
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {challenges.map((challenge) => {
            const IconComponent = IconMap[challenge.icon] || Sparkles; // 매핑된 아이콘 또는 기본 아이콘
            return (
              <Card 
                key={challenge.id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${challenge.bgGradient} opacity-50`} />
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-full bg-white shadow-md ${challenge.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {challenge.duration}
                      </Badge>
                      <Badge 
                        variant={challenge.difficulty === "쉬움" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {challenge.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <CardDescription className="text-slate-600 mb-6 leading-relaxed">
                    {challenge.description}
                  </CardDescription>
                  
                  {/* Participants Info */}
                  <div className="flex items-center mt-4 mb-4">
                    <Users className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700 mr-3">
                      {challenge._count.userChallenges}명 참여 중
                    </span>
                    <div 
                      className="flex -space-x-2 overflow-hidden cursor-pointer"
                      onMouseEnter={(e) => fetchParticipants(challenge.id, challenge.title, e)}
                      onMouseLeave={closeParticipantsPopup}
                    >
                      {(challenge.participantsPreview || []).map((participant, idx) => (
                        <Image
                          key={idx}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                          src={participant.profilePictureUrl || 'https://via.placeholder.com/150'} // 기본 이미지
                          alt={participant.nickname || '참여자'}
                          title={participant.nickname || '참여자'}
                          width={32} // 이미지 너비
                          height={32} // 이미지 높이
                        />
                      ))}
                      {challenge._count.userChallenges > 5 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-600 text-xs ring-2 ring-white">
                          +{challenge._count.userChallenges - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSelectChallenge(challenge.id)}
                    className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-medium py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                  >
                    <span>챌린지 시작하기</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700" />
              </Card>
            );
          })}
        </div>

        {/* Participants Popup */}
        {showParticipantsPopup && participantsPopupData && (
          <div
            className="fixed bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50"
            style={{ top: popupPosition.y + 10, left: popupPosition.x + 10, maxHeight: '300px', overflowY: 'auto' }}
            onMouseLeave={closeParticipantsPopup} // 팝업 밖으로 마우스가 나가면 닫기
          >
            <h3 className="font-bold text-lg mb-3">{participantsPopupData.challengeTitle} 참여자</h3>
            <div className="space-y-2">
              {participantsPopupData.participants.map((participant, idx) => (
                <div key={idx} className="flex items-center">
                  <Image
                    className="inline-block h-8 w-8 rounded-full ring-1 ring-gray-300 mr-2"
                    src={participant.profilePictureUrl || 'https://via.placeholder.com/150'}
                    alt={participant.nickname || '참여자'}
                    width={32} // 이미지 너비
                    height={32} // 이미지 높이
                  />
                  <span className="text-sm text-gray-800">{participant.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-500 mb-4">
            아직 결정하지 못하셨나요?
          </p>
          <Button variant="outline" className="px-8 py-3">
            모든 챌린지 둘러보기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;
