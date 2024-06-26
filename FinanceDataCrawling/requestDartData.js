const axios = require('axios');
const fs = require('fs');
const { Parser } = require('json2csv');
const { calculateCurRatio } = require('./ratioService/CurRatio');
const { calculateDebtEqRatio } = require('./ratioService/DebtEqRatio');
const { calculateSalesGrowthRate } = require('./ratioService/SalesGrowthRate');
const { calculateOpIncomeGrowthRate } = require('./ratioService/OpIncomeGrowthRate');
const { calculateOpProfitMargin } = require('./ratioService/OpProfitMargin');
const { calculateROA } = require('./ratioService/ROA');
const { calculateROE } = require('./ratioService/ROE');
const { calculateAssetTurnover } = require('./ratioService/AssetTurnover');
const { calculateDebtTurnover } = require('./ratioService/DebtTurnover');
const { calculateCapitalTurnover } = require('./ratioService/CapitalTurnover');
const { logTransform } = require('./utils/logTransform');
const { normalizeData } = require('./utils/normalizeData');
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

// 비동기 함수로 API 요청 보내기
async function fetchFinancialData() {
  let results = [];

  for (const company of kospi200Code) {
    const url = `${apiUrl}?crtfc_key=${apiKey}&corp_code=${company.corpCode}&bsns_year=${bsnsYear}&reprt_code=${reprtCode}`;

    try {
      const response = await axios.get(url);

      if (response.data.status === '000') {
        const list = response.data.list;

        // 각 항목 계산 함수 호출
        const curRatio = calculateCurRatio(list);
        const debtEqRatio = calculateDebtEqRatio(list);
        const salesGrowthRate = calculateSalesGrowthRate(list);
        const opIncomeGrowthRate = calculateOpIncomeGrowthRate(list);
        const opProfitMargin = calculateOpProfitMargin(list);
        const roa = calculateROA(list);
        const roe = calculateROE(list);
        const assetTurnover = calculateAssetTurnover(list);
        const debtTurnover = calculateDebtTurnover(list);
        const capitalTurnover = calculateCapitalTurnover(list);

        // 결과 객체 생성
        const result = {
          corp_code: company.corpCode,
          stock_code: company.stockCode,
          corp_name: company.corpName,
          cur_ratio: logTransform(curRatio),
          debt_eq_ratio: logTransform(debtEqRatio),
          sales_growth_rate: logTransform(salesGrowthRate),
          op_income_growth_rate: logTransform(opIncomeGrowthRate),
          op_profit_margin: logTransform(opProfitMargin),
          roa: logTransform(roa),
          roe: logTransform(roe),
          asset_turnover: logTransform(assetTurnover),
          debt_turnover: logTransform(debtTurnover),
          capital_turnover: logTransform(capitalTurnover)
        };

        results.push(result);
      } else {
        console.log(`API 응답 오류 for ${company.corpName}: ${response.data.message}`);
        break;  // 루프 중단
      }
    } catch (error) {
      console.error(`데이터 요청 중 오류 발생 for ${company.corpName}: ${error.message}`);
      break;  // 루프 중단
    }
  }

  // 정규화할 컬럼들
  const columnsToNormalize = [
    'cur_ratio',
    'debt_eq_ratio',
    'sales_growth_rate',
    'op_income_growth_rate',
    'op_profit_margin',
    'roa',
    'roe',
    'asset_turnover',
    'debt_turnover',
    'capital_turnover'
  ];

  // 각 컬럼 정규화
  columnsToNormalize.forEach(column => {
    results = normalizeData(results, column);
  });

  // CSV 파일로 저장
  const fields = [
    { label: 'corp_code', value: 'corp_code' },
    { label: 'stock_code', value: 'stock_code' },
    { label: 'corp_name', value: 'corp_name' },
    { label: 'cur_ratio', value: 'cur_ratio' },
    { label: 'debt_eq_ratio', value: 'debt_eq_ratio' },
    { label: 'sales_growth_rate', value: 'sales_growth_rate' },
    { label: 'op_income_growth_rate', value: 'op_income_growth_rate' },
    { label: 'op_profit_margin', value: 'op_profit_margin' },
    { label: 'roa', value: 'roa' },
    { label: 'roe', value: 'roe' },
    { label: 'asset_turnover', value: 'asset_turnover' },
    { label: 'debt_turnover', value: 'debt_turnover' },
    { label: 'capital_turnover', value: 'capital_turnover' }
  ];

  const opts = { fields };
  const parser = new Parser(opts);
  const csv = parser.parse(results);

  fs.writeFile('financial_data.csv', csv, (err) => {
    if (err) {
      console.error(`CSV 파일 저장 중 오류 발생: ${err.message}`);
    } else {
      console.log('CSV 파일이 성공적으로 저장되었습니다.');
    }
  });
}

// 비동기 함수 호출
fetchFinancialData();
