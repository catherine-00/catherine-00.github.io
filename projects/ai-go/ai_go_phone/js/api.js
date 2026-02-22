const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

export const api = {
  async login({email,password}) {
    await sleep(400);
    // TODO: 실제 서버 붙이면 교체
    if (email && password) return {token:'dev-token', user:{id:1,name:'김운전',email}};
    throw new Error('로그인 거부');
  },
  async signup(userData) {
    await sleep(600);
    // TODO: 실제 서버 붙이면 교체
    if (userData.name && userData.email && userData.password) {
      return { success: true, message: '회원가입이 완료되었습니다.' };
    }
    throw new Error('회원가입 실패');
  },
  async logout(){ await sleep(200); return true; },

  async fetchWrongNotes(){ await sleep(200);
    return [
      { id:15, tag:'신호 위반', date:'2024-01-10', ask:'교차로에서 신호위반으로 갑시다. 신호를 위반했을 때 벌점은?' },
      { id:23, tag:'차선 변경', date:'2024-01-08', ask:'편도 2차로 도로… 앞 차가 우회전 신호…?' },
      { id:8,  tag:'추월',     date:'2024-01-15', ask:'중앙선이 있는 도로… 앞차가 도로를 막고 있습니다.' },
    ];
  },

  async fetchAnalytics(){ await sleep(240);
    return {
      total:127, accuracy:84, error:16,
      weekly:[
        {d:'월',good:12,bad:3},{d:'화',good:15,bad:2},{d:'수',good:18,bad:4},
        {d:'목',good:14,bad:1},{d:'금',good:20,bad:3},{d:'토',good:16,bad:2},{d:'일',good:22,bad:1}
      ]
    };
  }
};
