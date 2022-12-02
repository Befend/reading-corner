// step 2：更改变量名，让人直接知道它的作用。
// 好的代码应该能清楚地表明它在做什么，而变量命名是代码清晰的关键，适当的变量命名能够提升代码的可读性。
function amountFor(aPerformance, play) {
  // thisAmount -> result
  // perf -> aPerformance
  let result = 0;
  switch (play.type) {
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
      throw new Error(`unknown type: ${play.type}`);     
  }
  return result;
}

function statement(invoices, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement fpr ${invoices.customer}\n` ;
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format;
  for (let perf of invoices.performances) {
    const play = plays[perf.playID];
    // 重构技术就是以微小的步伐修改测试，每次修改后就运行测试
    let thisAmount = amountFor(perf, play);
    
    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0);
    //add extra credit for every ten comedy attendees
    if ('comedy' === play.type) {
      volumeCredits += Math.floor(perf.audience / 5);
    }

    // print line for this order
    result += `  ${play.name}: ${format(thisAmount / 100)}  (${perf.audience} seats) \n`;
    totalAmount += thisAmount;
  }
  result += `Amount owed is ${format(totalAmount / 100)} \n`;
  result += `You earned ${volumeCredits} credits \n`
  return result;
}
