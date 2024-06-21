// dart에서 요청을 보내 기본 데이터 csv를 한글명으로 받아오는 파일
const axios = require('axios');
const { Parser } = require('json2csv');
const fs = require('fs');
require('dotenv').config();

const apiUrl = 'https://opendart.fss.or.kr/api/fnlttSinglAcnt.json';
const apiKey = process.env.API_KEY;
const corpCode = '00126380';
const bsnsYear = '2023';
const reprtCode = '11011';

const url = `${apiUrl}?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${bsnsYear}&reprt_code=${reprtCode}`;

axios.get(url)
  .then(response => {
    if (response.data.status !== '000') {
      throw new Error(`API 응답 오류: ${response.data.message}`);
    }

    const fields = [
      { label: '접수번호', value: 'rcept_no' },
      { label: '보고서 코드', value: 'reprt_code' },
      { label: '사업 연도', value: 'bsns_year' },
      { label: '고유번호', value: 'corp_code' },
      { label: '종목 코드', value: 'stock_code' },
      { label: '개별/연결구분', value: 'fs_div' },
      { label: '개별/연결명', value: 'fs_nm' },
      { label: '재무제표구분', value: 'sj_div' },
      { label: '재무제표명', value: 'sj_nm' },
      { label: '계정명', value: 'account_nm' },
      { label: '당기명', value: 'thstrm_nm' },
      { label: '당기일자', value: 'thstrm_dt' },
      { label: '당기금액', value: 'thstrm_amount' },
      { label: '전기명', value: 'frmtrm_nm' },
      { label: '전기일자', value: 'frmtrm_dt' },
      { label: '전기누적금액', value: 'frmtrm_amount' },
      { label: '전전기명', value: 'bfefrmtrm_nm' },
      { label: '전전기일자', value: 'bfefrmtrm_dt' },
      { label: '전전기금액', value: 'bfefrmtrm_amount' },
      { label: '계정과목 정렬순서', value: 'ord' },
      { label: '통화 단위', value: 'currency' }
    ];

    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(response.data.list);

    fs.writeFile('original_company_data_kor.csv', csv, (err) => {
      if (err) {
        console.error(`CSV 파일 저장 중 오류 발생: ${err.message}`);
      } else {
        console.log('CSV 파일이 성공적으로 저장되었습니다.');
      }
    });
  })
  .catch(error => {
    console.error(`데이터 요청 중 오류 발생: ${error.message}`);
  });