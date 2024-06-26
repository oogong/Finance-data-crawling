// krx에서 받아와 변환한 KOSPI200 json 파일과 Dart에서 받아온 회사고유 번호 xml을
// 결합하고 제외 기업들을 제외한 kospi200Code json을 반환하는 파일  
const fs = require('fs');
const xml2js = require('xml2js');

// 파일 경로
const kospiListPath = './kospi200list.json';
const xmlFilePath = './CORPCODE.xml';
const outputFilePath = './ogongCorpList.json';

// JSON 파일 읽기
const kospiList = JSON.parse(fs.readFileSync(kospiListPath, 'utf-8'));
const kospiCodes = kospiList.map(item => item.종목코드);

// 제외할 기업 코드 목록
const excludedCorpCodes = [
  '00113058', '00159102', '00111810', '00164973', '00980122', '01350869', 
  '00688996', '00547583', '00858364', '00139214', '00382199', '00120182', 
  '00878915', '00149646', '00104856', '00126256' , '00860332', '01133217', 
  '00126292', '00432102', '00111722', '00296290', '01412725' , '01762569'
];

// XML 파일 읽기 및 파싱
fs.readFile(xmlFilePath, 'utf-8', (err, data) => {
  if (err) {
    console.error(`XML 파일을 읽는 도중 오류가 발생했습니다: ${err.message}`);
    return;
  }

  xml2js.parseString(data, (err, result) => {
    if (err) {
      console.error(`XML 파일을 파싱하는 도중 오류가 발생했습니다: ${err.message}`);
      return;
    }

    const matchedCorps = [];

    // corpCode.xml에서 종목코드와 매칭되는 항목 찾기
    result.result.list.forEach(item => {
      const stockCode = item.stock_code[0].trim();  // XML 파일 내 종목코드는 공백이 있을 수 있으므로 트림 처리
      const corpCode = item.corp_code[0];
      const corpName = item.corp_name[0];

      // 제외할 기업 코드 목록에 포함되지 않는 항목만 추가
      if (kospiCodes.includes(stockCode) && !excludedCorpCodes.includes(corpCode)) {
        matchedCorps.push({
          stockCode: stockCode,
          corpName: corpName,
          corpCode: corpCode
        });
      }
    });

    // JSON 파일로 저장
    fs.writeFile(outputFilePath, JSON.stringify(matchedCorps, null, 2), 'utf-8', (err) => {
      if (err) {
        console.error(`JSON 파일을 저장하는 도중 오류가 발생했습니다: ${err.message}`);
        return;
      }
      console.log(`매칭된 종목이 ${outputFilePath}에 성공적으로 저장되었습니다.`);
    });
  });
});
