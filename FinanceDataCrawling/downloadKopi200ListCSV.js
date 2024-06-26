// download.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 중앙 에러 핸들러
function handleError(error) {
  console.error('An error occurred:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Headers:', error.response.headers);
    console.error('Data:', error.response.data);
  }
}

// OTP 생성 요청
async function generateOTP() {
  const url = "http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd";
  const data = new URLSearchParams({
    'locale': 'ko_KR',
    'tboxindIdx_finder_equidx0_0': '코스피 200',
    'indIdx': '1',
    'indIdx2': '028',
    'codeNmindIdx_finder_equidx0_0': '코스피 200',
    'param1indIdx_finder_equidx0_0': '',
    'trdDd': '20240625',
    'money': '3',
    'csvxls_isNo': 'false',
    'name': 'fileDown',
    'url': 'dbms/MDC/STAT/standard/MDCSTAT00601'
  });

  const headers = {
    'Accept': 'text/plain, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cookie': '__smVisitorID=ZhaxH4L4Nul; JSESSIONID=8j94ws51WjZqBv5YsvsFUFG7YpXjBm3xfGgFwIbyCbLdUei0zZCjV6x9DQ2C2mCv.bWRjX2RvbWFpbi9tZGNvd2FwMi1tZGNhcHAxMQ==',
    'Host': 'data.krx.co.kr',
    'Origin': 'http://data.krx.co.kr',
    'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201010106',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest'
  };

  try {
    const response = await axios.post(url, data, { headers: headers });
    console.log('OTP response headers:', response.headers); // 디버그를 위해 OTP 응답 헤더 로그 출력
    console.log('OTP response data:', response.data); // 디버그를 위해 OTP 응답 로그 출력
    return response.data;
  } catch (error) {
    handleError(error);
    throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있게 합니다.
  }
}

// 파일 다운로드 요청
async function downloadFile(otp) {
  const url = "http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd";
  const data = new URLSearchParams({
    'code': otp
  });

  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': '__smVisitorID=ZhaxH4L4Nul; JSESSIONID=NKrTvslBW8w5joJASYbqZjSpyRNaLMgbmRrnAwTjY232jmcMzOwA0gKoIUOacWIu.bWRjX2RvbWFpbi9tZGNvd2FwMi1tZGNhcHAxMQ==',
    'Host': 'data.krx.co.kr',
    'Origin': 'http://data.krx.co.kr',
    'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201010106',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  };

  try {
    const response = await axios.post(url, data, {
      headers: headers,
      responseType: 'stream' // stream으로 응답을 받습니다.
    });

    if (response.headers['content-length'] === '0') {
      console.error('Received empty response');
      return;
    }

    const output = fs.createWriteStream(path.resolve(__dirname, 'kospi200list.csv'));
    response.data.pipe(output);

    output.on('finish', () => {
      console.log('File downloaded successfully');
    });

    output.on('error', (error) => {
      handleError(error);
    });
  } catch (error) {
    handleError(error);
    throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있게 합니다.
  }
}

// 메인 함수 실행
async function main() {
  try {
    const otp = await generateOTP();
    await downloadFile(otp);
  } catch (error) {
    handleError(error); // 중앙 에러 핸들러에서 에러를 처리합니다.
  }
}

// 메인 함수 호출
main();
