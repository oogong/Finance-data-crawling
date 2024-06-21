// 총자본 회전율 계산 함수
function calculateCapitalTurnover(data) {
  let sales = 0;
  let totalEquity = 0;

  // 우선적으로 '재무제표'에서 찾기
  data.forEach(item => {
    if (item.fs_nm === '재무제표' && item.account_nm === '매출액') {
      sales = parseFloat(item.thstrm_amount.replace(/,/g, ''));
    }
    if (item.fs_nm === '재무제표' && item.account_nm === '자본총계') {
      totalEquity = parseFloat(item.thstrm_amount.replace(/,/g, ''));
    }
  });

  // '재무제표'에서 찾지 못한 경우 '연결재무제표'에서 찾기
  if (sales === 0 || totalEquity === 0) {
    data.forEach(item => {
      if (item.fs_nm === '연결재무제표' && item.account_nm === '매출액' && sales === 0) {
        sales = parseFloat(item.thstrm_amount.replace(/,/g, ''));
      }
      if (item.fs_nm === '연결재무제표' && item.account_nm === '자본총계' && totalEquity === 0) {
        totalEquity = parseFloat(item.thstrm_amount.replace(/,/g, ''));
      }
    });
  }

  if (totalEquity === 0) {
    return 0; // 자본총계가 0이면 총자본 회전율을 계산할 수 없음
  }

  const capitalTurnover = sales / totalEquity;
  return capitalTurnover;
}

module.exports = { calculateCapitalTurnover };