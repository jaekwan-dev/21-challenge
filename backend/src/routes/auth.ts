import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const router = express.Router();

router.get('/kakao', (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthURL);
});

router.get('/kakao/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_REST_API_KEY,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id, kakao_account, properties } = userResponse.data;
    const { nickname, profile_image } = properties;
    const email = kakao_account?.email; // 이메일 정보는 kakao_account 객체 안에 있음

    // Prisma를 사용하여 사용자 정보 저장 또는 업데이트
    const prisma = (req as any).prisma; // req.prisma 접근을 위해 타입 캐스팅
    const user = await prisma.user.upsert({
      where: { kakaoId: String(id) },
      update: {
        email: email || null,
        nickname: nickname || '',
        profilePictureUrl: profile_image || null,
      },
      create: {
        kakaoId: String(id),
        email: email || null,
        nickname: nickname || '',
        profilePictureUrl: profile_image || null,
      },
    });

    // 프론트엔드로 리디렉션하면서 사용자 정보를 쿼리 파라미터로 전달
    // 여기서는 DB에 저장된 user 객체의 kakaoId를 userId로 사용
    res.redirect(`http://localhost:3000/login/success?userId=${encodeURIComponent(user.kakaoId)}`);

  } catch (error) {
    console.error(error);
    res.status(500).send('카카오 로그인 중 오류가 발생했습니다.');
  }
});

// 사용자 상세 정보 조회 API
router.get('/user-details/:kakaoId', async (req, res) => {
  const { kakaoId } = req.params;
  const prisma = (req as any).prisma;

  try {
    const user = await prisma.user.findUnique({
      where: { kakaoId },
      select: { kakaoId: true, email: true, nickname: true, profilePictureUrl: true },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
});

export default router;
