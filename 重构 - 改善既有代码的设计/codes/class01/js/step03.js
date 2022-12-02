// step 3: 移除play变量
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

function statement(invoices) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement fpr ${invoices.customer}\n` ;
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format;
  for (let perf of invoices.performances) {
    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0);
    //add extra credit for every ten comedy attendees
    if ('comedy' === playFor(perf).type) {
      volumeCredits += Math.floor(perf.audience / 5);
    }

    // print line for this order
    result += `  ${playFor(perf).name}: ${format(amountFor(perf) / 100)}  (${perf.audience} seats) \n`;
    totalAmount += amountFor(perf);
  }
  result += `Amount owed is ${format(totalAmount / 100)} \n`;
  result += `You earned ${volumeCredits} credits \n`
  return result;
}
