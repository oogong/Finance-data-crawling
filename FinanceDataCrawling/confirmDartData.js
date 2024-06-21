// 데이터 결측치를 확인하는 파일
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// 현재 연도를 가져와서 전년도로 설정
const currentYear = new Date().getFullYear();
const bsnsYear = currentYear - 1;

// 파일 경로
const kospi200CodePath = './kospi200Code.json';

// API 설정
const apiUrl = 'https://opendart.fss.or.kr/api/fnlttSinglAcnt.json';
const apiKey = process.env.API_KEY;
const reprtCode = '11011';

// JSON 파일 읽기
const kospi200Code = JSON.parse(fs.readFileSync(kospi200CodePath, 'utf-8'));

// 누락된 항목을 카운트하는 객체
const missingCounts = {};

// 조건 확인 함수
function getMissingAccounts(list, requiredAccounts) {
  return requiredAccounts.filter(account => {
    // 계정명이 여러개 있을 수 있으므로 배열로 처리
    const accountNames = account.split('||').map(name => name.trim());
    
    // 계정명 배열 중 하나라도 있으면 해당 계정은 누락되지 않음
    const hasAccount = accountNames.some(name => list.some(item => item.account_nm === name));
    
    return !hasAccount;
  });
}

// 비동기 함수로 API 요청 보내기
async function checkApiStatus(requiredAccounts) {
  // 초기화
  requiredAccounts.forEach(account => {
    missingCounts[account] = 0;
  });

  for (const company of kospi200Code) {
    const url = `${apiUrl}?crtfc_key=${apiKey}&corp_code=${company.corpCode}&bsns_year=${bsnsYear}&reprt_code=${reprtCode}`;

    try {
      const response = await axios.get(url);

      if (response.data.status === '000') {
        const list = response.data.list;
        const missingAccounts = getMissingAccounts(list, requiredAccounts);

        if (missingAccounts.length > 0) {
          console.log(`누락된 계정명 for ${company.corpName} (${company.corpCode}): ${missingAccounts.join(', ')}`);
          missingAccounts.forEach(account => {
            missingCounts[account]++;
          });
        }
      } else {
        console.log(`API 응답 오류 for ${company.corpName}: ${response.data.message}`);
        break;  // 루프 중단
      }
    } catch (error) {
      console.error(`데이터 요청 중 오류 발생 for ${company.corpName}: ${error.message}`);
      break;  // 루프 중단
    }
  }

  console.log('모든 요청이 완료되었습니다.');
  console.log('누락된 항목 개수:');
  for (const account in missingCounts) {
    console.log(`${account}: ${missingCounts[account]}개`);
  }
}

// 비동기 함수 호출, 필요 계정명을 매개변수로 전달
checkApiStatus(['영업이익']);