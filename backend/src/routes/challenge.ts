import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Request 객체에 prisma 속성을 추가하기 위한 타입 선언
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}

// Helper functions for random challenge attributes
const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]!;
};

const colors = ["text-blue-600", "text-orange-600", "text-green-600", "text-purple-600", "text-red-600"];
const bgGradients = ["from-blue-50 to-cyan-50", "from-orange-50 to-red-50", "from-green-50 to-emerald-50", "from-purple-50 to-indigo-50", "from-red-50 to-pink-50"];
const durations = ["21일", "30일", "60일"];
const difficulties = ["쉬움", "보통", "어려움"];

const getRandomColor = () => getRandomElement(colors);
const getRandomBgGradient = () => getRandomElement(bgGradients);
const getRandomDuration = () => getRandomElement(durations);
const getRandomDifficulty = () => getRandomElement(difficulties);

// Icon selection based on title keywords
const getIconByChallengeTitle = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("물")) return "Droplets";
  if (titleLower.includes("운동")) return "Dumbbell";
  if (titleLower.includes("독서") || titleLower.includes("공부")) return "BookOpen";
  if (titleLower.includes("코딩")) return "Code"; // Assuming 'Code' icon exists
  return "Sparkles"; // Default icon
};

// 챌린지 진행 현황 업데이트 API
router.post('/:challengeId/status', async (req: Request, res) => {
  const { challengeId } = req.params;
  const { userId, dailyStatus, startDate } = req.body; // startDate 추가

  if (!userId || !dailyStatus || !startDate) {
    return res.status(400).json({ message: 'userId, dailyStatus, startDate는 필수입니다.' });
  }

  try {
    const parsedChallengeId = parseInt(challengeId!);
    if (isNaN(parsedChallengeId)) {
      return res.status(400).json({ message: '유효하지 않은 challengeId입니다.' });
    }

    // 챌린지 존재 여부 확인 (선택 사항, 필요에 따라 추가)
    const challengeExists = await req.prisma.challenge.findUnique({
      where: { id: parsedChallengeId },
    });

    if (!challengeExists) {
      // 챌린지가 없으면 새로 생성 (임시 데이터이므로)
      await req.prisma.challenge.create({
        data: {
          id: parsedChallengeId,
          title: `챌린지 ${parsedChallengeId}`,
          description: `챌린지 ${parsedChallengeId}에 대한 설명`,
          icon: "Sparkles", // 임시 아이콘
          color: "text-gray-500",
          bgGradient: "from-gray-50 to-gray-100",
          duration: "21일",
          difficulty: "쉬움",
        },
      });
    }

    // 사용자 존재 여부 확인 및 생성
    await req.prisma.user.upsert({
      where: { kakaoId: userId! },
      update: {},
      create: { kakaoId: userId!, nickname: '기본 닉네임' }, // nickname 필드 추가
    });

    const userChallenge = await req.prisma.userChallenge.upsert({
      where: { userId_challengeId: { userId: userId!, challengeId: parsedChallengeId } },
      update: { dailyStatus: dailyStatus as any }, // JSON 필드 업데이트
      create: {
        userId: userId!,
        challengeId: parsedChallengeId,
        dailyStatus: dailyStatus as any,
        startDate: new Date(startDate),
      },
    });

    console.log(`User ${userId} updated status for challenge ${challengeId}:`, dailyStatus);
    res.status(200).json({ message: '챌린지 현황이 업데이트되었습니다.', userChallenge });
  } catch (error) {
    console.error('챌린지 현황 업데이트 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 커뮤니티 현황 조회 API
router.get('/:challengeId/community-status', async (req: Request, res) => {
  const { challengeId } = req.params;

  try {
    const parsedChallengeId = parseInt(challengeId!);
    if (isNaN(parsedChallengeId)) {
      return res.status(400).json({ message: '유효하지 않은 challengeId입니다.' });
    }

    const communityData = await req.prisma.userChallenge.findMany({
      where: { challengeId: parsedChallengeId },
      select: {
        userId: true,
        dailyStatus: true,
        user: { // User 정보 포함
          select: {
            nickname: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    const formattedCommunityData = communityData.map((data: { userId: string; dailyStatus: any; user: { nickname: string | null; profilePictureUrl: string | null; } | null }) => {
      const completedDays = (data.dailyStatus as boolean[]).filter(Boolean).length;
      const completionRate = Math.floor((completedDays / 21) * 100);
      const nickname = data.user?.nickname || `익명 사용자 ${data.userId.substring(0, 4)}`; // 실제 닉네임 사용 또는 임시 닉네임
      const profilePictureUrl = data.user?.profilePictureUrl || ''; // 프로필 사진 URL 포함
      return { nickname, completionRate, profilePictureUrl };
    });

    res.status(200).json(formattedCommunityData);
  } catch (error) {
    console.error('커뮤니티 현황 가져오기 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 특정 사용자의 챌린지 진행 현황 조회 API
router.get('/:challengeId/user-status/:userId', async (req: Request, res) => {
  const { challengeId, userId } = req.params;

  try {
    const parsedChallengeId = parseInt(challengeId!); // challengeId가 string | undefined 이므로 non-null assertion
    if (isNaN(parsedChallengeId)) {
      return res.status(400).json({ message: '유효하지 않은 challengeId입니다.' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'userId가 필요합니다.' });
    }

    const userChallenge = await req.prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId: userId!,
          challengeId: parsedChallengeId,
        },
      },
      select: {
        dailyStatus: true,
        startDate: true,
      },
    });

    if (!userChallenge) {
      return res.status(404).json({ message: '사용자의 챌린지 기록을 찾을 수 없습니다.' });
    }

    res.status(200).json(userChallenge);
  } catch (error) {
    console.error('사용자 챌린지 현황 조회 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 특정 챌린지의 전체 참여자 목록 조회 API
router.get('/:challengeId/participants', async (req: Request, res) => {
  const { challengeId } = req.params;

  try {
    const parsedChallengeId = parseInt(challengeId!); // challengeId가 string | undefined 이므로 non-null assertion
    if (isNaN(parsedChallengeId)) {
      return res.status(400).json({ message: '유효하지 않은 challengeId입니다.' });
    }

    const participants = await req.prisma.userChallenge.findMany({
      where: { challengeId: parsedChallengeId },
      select: {
        user: {
          select: {
            nickname: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: {
        user: {
          nickname: 'asc', // 닉네임으로 정렬
        },
      },
    });

    const formattedParticipants = participants
      .filter((p: { user: { nickname: string | null; profilePictureUrl: string | null; } | null }) => p.user !== null) // user가 null이 아닌 경우만 필터링
      .map((p: { user: { nickname: string | null; profilePictureUrl: string | null; } | null }) => ({
        nickname: p.user!.nickname,
        profilePictureUrl: p.user!.profilePictureUrl,
      }));

    res.status(200).json(formattedParticipants);
  } catch (error) {
    console.error('참여자 목록 조회 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 모든 챌린지 조회 API (관리자용)
router.get('/', async (req: Request, res) => {
  try {
    const challenges = await req.prisma.challenge.findMany({
      include: {
        _count: {
          select: { userChallenges: true },
        },
        userChallenges: {
          take: 5, // 최대 5명의 참여자만 가져옴
          orderBy: { startDate: 'desc' }, // 최신 참여자 순
          select: {
            user: {
              select: {
                nickname: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    const formattedChallenges = challenges.map((challenge: { id: number; title: string; description: string | null; icon: string; color: string; bgGradient: string; duration: string; difficulty: string; createdAt: Date; _count: { userChallenges: number; }; userChallenges: { startDate: Date; user: { nickname: string | null; profilePictureUrl: string | null; } | null; }[]; }) => ({
      ...challenge,
      participantsPreview: challenge.userChallenges.map((uc: { startDate: Date; user: { nickname: string | null; profilePictureUrl: string | null; } | null; }) => uc.user),
    }));

    res.status(200).json(formattedChallenges);
  } catch (error) {
    console.error('챌린지 목록 조회 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 특정 챌린지 조회 API
router.get('/:id', async (req: Request, res) => {
  const { id } = req.params;

  try {
    const parsedId = parseInt(id!);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 챌린지 ID입니다.' });
    }

    const challenge = await req.prisma.challenge.findUnique({
      where: { id: parsedId },
      include: {
        _count: {
          select: { userChallenges: true },
        },
      },
    });

    if (!challenge) {
      return res.status(404).json({ message: '챌린지를 찾을 수 없습니다.' });
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error('특정 챌린지 조회 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 챌린지 생성 API (관리자용)
router.post('/', async (req: Request, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: '제목은 필수입니다.' });
  }

  try {
    const newChallenge = await req.prisma.challenge.create({
      data: {
        title,
        description: description || '',
        icon: getIconByChallengeTitle(title),
        color: getRandomColor(),
        bgGradient: getRandomBgGradient(),
        duration: getRandomDuration(),
        difficulty: getRandomDifficulty(),
      },
    });
    res.status(201).json(newChallenge);
  } catch (error) {
    console.error('챌린지 생성 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 챌린지 수정 API (관리자용)
router.put('/:id', async (req: Request, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const parsedId = parseInt(id!);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 챌린지 ID입니다.' });
    }

    const updatedChallenge = await req.prisma.challenge.update({
      where: { id: parsedId },
      data: {
        title: title || undefined,
        description: description || undefined,
        // 아이콘, 색상 등은 수정 시 변경하지 않음 (자동 생성된 값 유지)
      },
    });
    res.status(200).json(updatedChallenge);
  } catch (error) {
    console.error('챌린지 수정 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 챌린지 삭제 API (관리자용)
router.delete('/:id', async (req: Request, res) => {
  const { id } = req.params;

  try {
    const parsedId = parseInt(id!);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: '유효하지 않은 챌린지 ID입니다.' });
    }

    await req.prisma.challenge.delete({
      where: { id: parsedId },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('챌린지 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

export default router;