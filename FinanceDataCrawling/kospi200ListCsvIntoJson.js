// krx에서 가져온 KOSPI200.csv 파일을 json으로 변환하는 코드
const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');

const inputFilePath = './kospi200list.csv';  // CSV 파일 경로
const outputFilePath = 'kospi200list.json';  // JSON 파일 경로

const results = [];

fs.createReadStream(inputFilePath)
  .pipe(iconv.decodeStream('euc-kr'))  // euc-kr 인코딩을 utf-8로 변환
  .pipe(iconv.encodeStream('utf-8'))
  .pipe(csv())
  .on('data', (data) => {
    // 종목코드와 종목명만 추출하여 results 배열에 추가
    results.push({
      종목코드: data['종목코드'],
      종목명: data['종목명']
    });
  })
  .on('end', () => {
    // results 배열을 JSON 파일로 저장
    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`JSON 파일이 ${outputFilePath}에 성공적으로 저장되었습니다.`);
  })
  .on('error', (err) => {
    console.error(`파일 처리 중 오류 발생: ${err.message}`);
  });
