// step06: 移除观众量积分总和volumeCredits 和 总数totalAmount
// 对于重构过程中的性能问题，大多数情况下可以忽略它。
// 如果重构引入了性能损耗，先完成重构，再完成性能优化.
function playFor(aPerformance) {
  return plays[aPerformance.playID];
}

function amountFor(aPerformance) {
  let result = 0;
  switch (playFor(aPerformance).type) {
    case 'tragedy':
      result = 40000;
      if (aPerformance.audience > 30) {
        result += 1000 * (aPerformance.audience - 30);
      }
      break;
    case 'comedy':
      result = 30000;
      if (aPerformance.audience > 20) {
        result += 10000 + 500 * (aPerformance.audience - 20);
      }
      result += 300 * aPerformance.audience;
      break;
    default:
      throw new Error(`unknown type: ${playFor(aPerformance).type}`);     
  }
  return result;
}

function volumeCreditsFor(aPerformance) {
  let result = 0;
  result += Math.max(aPerformance.audience - 30, 0);
  if ('comedy' === playFor(aPerformance).type) {
    result += Math.floor(aPerformance.audience / 5);
  }
  return result;
}

function statement(invoices) {
  let result = `Statement fpr ${invoices.customer}\n` ;
  for (let perf of invoices.performances) {
    // print line for this order
    result += `  ${playFor(perf).name}: ${usd(amountFor(perf))}  (${perf.audience} seats) \n`;
  }
  // totalAmount变量
  // let totalAmount = 0;
  // for (let perf of invoices.performances) {
  //   totalAmount += amountFor(perf);
  // }
  // volumeCredits变量
  // let volumeCredits = 0;
  // for (let perf of invoices.performances) {
  //   volumeCredits += volumeCreditsFor(perf);
  // }
  result += `Amount owed is ${usd(totalAmount())} \n`;
  result += `You earned ${totalVolumeCredits()} credits \n`;
  return result;
}

function usd(aNumber) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(aNumber / 100);
}

function totalAmount() {
  let result = 0;
  for (let perf of invoices.performances) {
    result += amountFor(perf);
  }
  return result;
}

function totalVolumeCredits() {
  let result = 0;
  for (let perf of invoices.performances) {
    result += volumeCreditsFor(perf);
  }
  return result;
}