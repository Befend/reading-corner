# 6 重构

## 6.1 提炼函数（Extract Function）
曾用名：提炼函数（Extract Method）
反向重构：内联函数
### 动机
提炼函数是我最常用的重构之一。浏览一段代码，我们应该理解其作用，然后将其提炼到一个独立的函数中，并以这段代码的用途为这个函数命名。

### 做法
+ 创造一个新函数，根据这个函数的意图来对它命名（以它“做什么”来命名，而不是以它“怎样做”命名
+ 将待提炼的代码从源函数代码复制到新建的目标函数中
+ 所有变量都处理完之后，编译
+ 在源函数中，将被提炼代码段替换为对目标函数的调用
+ 测试
+ 查看其他代码是否有与被提炼的代码段相同或相似之处。如果有，考虑使用以函数调用取代内联代码令其调用提炼出的新函数

### 范例：无局部变量
> 提炼前：
```js
function printOwing(invoice) {
  let outstanding = 0;
  console.log("****************************");
  console.log("****** Customer Owes *******");
  console.log("****************************");

  // calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // record due date
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  // print details
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
}
```

> 提炼后：
```js
function printOwing(invoice) {
  let outstanding = 0;
  printBanner();

  // calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // record due date
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  // print details
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
}

function printBanner() {
  console.log("****************************");
  console.log("****** Customer Owes *******");
  console.log("****************************");
}
```
### 范例：有局部变量
> 提炼前：
```js
function printOwing(invoice) {
  let outstanding = 0;
  printBanner();

  // calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // record due date
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  // print details
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
}

function printBanner() {
  console.log("****************************");
  console.log("****** Customer Owes *******");
  console.log("****************************");
}
```

> 提炼后：
```js
function printOwing(invoice) {
  let outstanding = 0;
  printBanner();

  // calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // record due date
  recordDueDate(invoice);

  // print details
  printDetails(invoice, outstanding);
}

function printBanner() {
  console.log("****************************");
  console.log("****** Customer Owes *******");
  console.log("****************************");
}

function printDetails(invoice, outstanding) {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
}

function recordDueDate(invoice) {
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
}
```

### 范例：对局部变量再赋值
> 提炼前：
```js
function printOwing(invoice) {
  let outstanding = 0;
  printBanner();

  // calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // record due date
  recordDueDate(invoice);

  // print details
  printDetails(invoice, outstanding);
}

function printBanner() {
  console.log("****************************");
  console.log("****** Customer Owes *******");
  console.log("****************************");
}

function printDetails(invoice, outstanding) {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
}

function recordDueDate(invoice) {
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
}
```

> 提炼后：
```js
function printOwing(invoice) {
  printBanner();
  // calculate outstanding
  const outstanding = calculateOutstanding(invoice);
  // record due date
  recordDueDate(invoice);
  // print details
  printDetails(invoice, outstanding);
}

function printBanner() {
  console.log("****************************");
  console.log("****** Customer Owes *******");
  console.log("****************************");
}

function printDetails(invoice, outstanding) {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
}

function recordDueDate(invoice) {
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
}

function calculateOutstanding(invoice) {
  let result = 0;
  for (const o of invoice.orders) {
    result += o.amount;
  }
  return result;
}
```

## 6.2 内联函数（Inline Function）
曾用名：内联函数（Inline Method）
反向重构：提炼函数
### 动机
本书经常以简短的函数表现动作意图，这样会使代码更清晰易读。但有时候你会遇到某些函数，其内部代码和函数名称同样清晰易读。也可能你重构了该函数的内部实现，使其内容和其名称同样清晰。若果真如此，你就应该去掉这个函数，直接使用其中的代码。间接性可能带来帮助，但非必要的间接性总是让人不舒服。

另一种需要使用内联函数的情况是：我手上有一群组织不甚合理的函数。可以将它们都内联到一个大型函数中，再重新提炼出小函数。

### 做法
+ 检查函数，确定它不具多态性
+ 找出这个函数的所有调用点
+ 将这个函数的所有调用点都替换为函数本体
+ 每次替换之后，执行测试
+ 删除该函数的定义

### 范例
> 内联前：
```js
// example.01
function rating(aDriver) {
  return moreThanFiveLateDeliveries(aDriver) ? 2 : 1;
}

function moreThanFiveLateDeliveries(aDriver) {
  return aDriver.numberOfLateDelivers > 5 ;
}
```

```js
// example.02
function reportLines(aCustomer) {
  const lines = [];
  gatherCustomerData(lines, aCustomer);
  return lines;
}

function gatherCustomerData(out, aCustomer) {
  out.push(["name", aCustomer.name]);
  out.push(["location", aCustomer.location]);
}
```

> 内联后：
```js
// example.01
function rating(aDriver) {
  return aDriver.numberOfLateDelivers > 5 ? 2 : 1;
}
```

```js
// example.02
function reportLines(aCustomer) {
  const lines = [];
  lines.push(["name", aCustomer.name]);
  lines.push(["location", aCustomer.location]);
  return lines;
}
```
**重构的重点在于始终小步前进**

## 6.3 提炼变量（Extract Variable）
曾用名：引入解释性变量（Introduce Explaining Variable）
反向重构：内联变量

### 动机
表达式可能非常复杂而难以阅读。这种情况下，局部变量可以帮助我们将表达式分解为比较容易管理的形式。在面对这一块复杂逻辑时，局部变量使我能给其中的一部分命名，这样我们就能更好地理解这部分逻辑是要干什么。

### 做法
+ 确认要提炼的表达式没有副作用
+ 声明一个不可修改的变量，把你想要提炼的表达式复制一份，以该表达式的结果值给这个变量赋值
+ 用这个新变量取代原来的表达式
+ 测试

### 范例
> 提炼前：
```js
function price(order) {
  // price is base price - quantity discount + shipping
  return order.quantity * order.itemPrice -
    Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 +
    Math.min(order.quantity * order.itemPrice * 0.1, 100);
}
```

> 提炼后：
```js
function price(order) {
  // price is base price - quantity discount + shipping
  const basePrice = order.quantity * order.itemPrice;
  const quantityDiscount = Math.max(0, order.quantity - 500) * order.itemPrice * 0.05;
  const shipping = Math.min(basePrice * 0.1, 100);
  return basePrice - quantityDiscount + shipping;
}
```

### 范例：在一个类中
> 提炼前：
```js
class Order {
  constructor(aRecord) {
    this._data = aRecord;
    get quantity() {
      return this._data.quantity;
    }
    get itemPrice() {
      return this._data.itemPrice;
    }
    get price() {
      return this.quantity * this.itemPrice -
        Math.max(0, this.quantity - 500) * this.itemPrice * 0.05 +
        Math.min(this.quantity * this.itemPrice * 0.1, 100);
    }
  }
}
```

> 提炼后：
```js
class Order {
  constructor(aRecord) {
    this._data = aRecord;
    get quantity() {
      return this._data.quantity;
    }
    get itemPrice() {
      return this._data.itemPrice;
    }
    get price() {
      return this.basePrice - this.quantityDiscount + this.shipping;
    }
    get basePrice() {
      return this.quantity * this.itemPrice
    }
    get quantityDiscount() {
      return Math.max(0, this.quantity - 500) * this.itemPrice * 0.05;
    }
    get shipping() {
      return Math.min(this.basePrice * 0.1, 100);
    }
  }
}
```
### 好处
它们提供了合适的上下文，方便分享相关的逻辑和数据。