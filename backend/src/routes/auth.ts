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

    const { id, properties } = userResponse.data;
    const { nickname, profile_image } = properties;

    // TODO: 받은 사용자 정보(id, nickname, profile_image)를 DB에 저장하거나 업데이트하는 로직 추가

    const user = {
      id,
      nickname,
      profile_image,
    };

    // 프론트엔드로 리디렉션하면서 사용자 정보를 쿼리 파라미터로 전달
    res.redirect(`http://localhost:3000/login/success?user=${encodeURIComponent(JSON.stringify(user))}`);

  } catch (error) {
    console.error(error);
    res.status(500).send('카카오 로그인 중 오류가 발생했습니다.');
  }
});

export default router;
