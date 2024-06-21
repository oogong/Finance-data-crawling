// dart에서 요청을 보내 기본 데이터 csv를 받아오는 파일
const axios = require('axios');
const { Parser } = require('json2csv');
const fs = require('fs');
require('dotenv').config();

const apiUrl = 'https://opendart.fss.or.kr/api/fnlttSinglAcnt.json';
const apiKey = process.env.API_KEY;
const corpCode = '01762569';
const bsnsYear = '2023';
const reprtCode = '11011';

const url = `${apiUrl}?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${bsnsYear}&reprt_code=${reprtCode}`;

axios.get(url)
  .then(response => {
    if (response.data.status !== '000') {
      throw new Error(`API 응답 오류: ${response.data.message}`);
    }

    const fields = [
      { label: 'rcept_no', value: 'rcept_no' },
      { label: 'reprt_code', value: 'reprt_code' },
      { label: 'bsns_year', value: 'bsns_year' },
      { label: 'corp_code', value: 'corp_code' },
      { label: 'stock_code', value: 'stock_code' },
      { label: 'fs_div', value: 'fs_div' },
      { label: 'fs_nm', value: 'fs_nm' },
      { label: 'sj_div', value: 'sj_div' },
      { label: 'sj_nm', value: 'sj_nm' },
      { label: 'account_nm', value: 'account_nm' },
      { label: 'thstrm_nm', value: 'thstrm_nm' },
      { label: 'thstrm_dt', value: 'thstrm_dt' },
      { label: 'thstrm_amount', value: 'thstrm_amount' },
      { label: 'frmtrm_nm', value: 'frmtrm_nm' },
      { label: 'frmtrm_dt', value: 'frmtrm_dt' },
      { label: 'frmtrm_amount', value: 'frmtrm_amount' },
      { label: 'bfefrmtrm_nm', value: 'bfefrmtrm_nm' },
      { label: 'bfefrmtrm_dt', value: 'bfefrmtrm_dt' },
      { label: 'bfefrmtrm_amount', value: 'bfefrmtrm_amount' },
      { label: 'ord', value: 'ord' },
      { label: 'currency', value: 'currency' }
    ];

    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(response.data.list);

    fs.writeFile('original_company_data_eng.csv', csv, (err) => {
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