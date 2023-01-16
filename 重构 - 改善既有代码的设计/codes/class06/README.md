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

## 6.4 内联变量（Inline Variable）
曾用名：内联临时变量（Inline Temp）  
反向重构：提炼变量

### 动机
在一个函数内部，变量能给表达式提供有意义的名字，因此通常变量是好东西。但有时候，这个名字并不比表达式本身更具表现力。还有些时候，变量可能会妨碍重构附近的代码。若果真如此，就应该通过内联的手法消除变量。  

### 做法
+ 检查确认变量赋值语句的右侧表达式没有副作用 
+ 如果变量没有被声明为不可修改，先将其变为不可修改，并执行测试
+ 找到第一处使用该变量的地方，将其替换为直接使用赋值语句的右侧表达式 
+ 测试 
+ 重复前面两步，逐一替换为直接使用赋值语句的右侧表达式 
+ 删除该变量的声明点和赋值语句 
+ 测试

## 6.5 改变函数声明（Change Function Declaration)
别名：函数改名（ReName Function）  
曾用名： 函数改名（ReName Method）  
曾用名： 添加参数（Add Parameter）  
曾用名： 移除参数（Remove Parameter）  
别名： 修改签名（Change Signature）  
### 动机 
函数是我们将程序拆分成小块的主要方式。函数声明则展现了如何将这些小块组合在一起工作————可以说，它们就是软件系统的关节。  
对于这些关节而言，最重要的元素当属函数的名字。一个好的名字能让人一眼就看出函数的用途。（有一个改进函数名字的好方法：先写一句注释描述这个函数的用途，再把这句注释变成函数的名字。）   
对于函数的参数，道理也是一样的。函数的参数列表阐述了函数如何与外部世界共处。

### 做法 
在进行此重构时，查看变更的范围，自问是否能一步到位地修改函数声明及其所有调用者。如果可以，我们可以采用简单的做法。迁移式的做法让我可以逐步修改调用方代码，如果函数被很多地方调用，或者修改不容易，或者要修改的是一个多态函数，或者对函数声明的修改比较复杂，能渐进式地逐步修改就很重要。  

#### 简单做法 
+ 如果想要移除一个参数，需要先确定函数体内没有使用该参数 
+ 修改函数声明，使其成为你期望的状态 
+ 找出所用使用旧的函数声明的地方，将它们改为使用新的函数声明 
+ 测试 

#### 迁移式的做法
+ 如果有必要的话，先对函数体内部加以重构，使后面的提炼步骤易于开展
+ 使用提炼函数将函数体提炼成一个新函数
+ 如果提炼出的函数需要新增参数，用前面的简单做法添加即可
+ 测试
+ 对旧函数使用内联函数
+ 如果新函数使用了临时的名字，再次使用改变函数声明将其改回原来的名字
+ 测试

### 范例：函数改名（简单做法）
```js 
//改名前
function circum(radius) {
  return 2 * Math.PI * radius;
}

// 改名后
function circumference(radius) {
  return 2 * Math.PI * radius;
}
```

### 范例：函数改名（迁移式做法）
```js 
//改名前
function circum(radius) {
  return 2 * Math.PI * radius;
}

// 改名后
function circum(radius) {
  return circumference(radius);
}
function circumference(radius) {
  return 2 * Math.PI * radius;
}
```

### 范例：添加参数
> 改名前
```js
class Book {
  constructor(customer) {
    this.addReservation(customer);
  }
  addReservation(customer) {
    this._reservations.push(customer);
  }
}
```

> 改名后
```js
class Book {
  constructor(customer) {
    this.addReservation(customer);
  }
  addReservation(customer) {
    this.zz_addReservation(customer， false);
  }
  // 增加参数
  zz_addReservation(customer, isPriority) {
    // 引入断言
    assert(isPriority === true || isPriority === false)
    this._reservations.push(customer);
  }
}
```

### 范例：把参数改为属性
> 修改前
```js 
function isNewEngland(aCustomer) {
  return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(aCustomer.address.state);
}

const newEnglanders = someCustomers.filter(c => inNewEngland(c));
...
```

> 修改后
```js 
function isNewEngland(stateCode) {
  return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}

const newEnglanders = someCustomers.filter(c => inNewEngland(c.address.state));
...
```
自动化重构工具减少了迁移式做法的用武之地，同时也使迁移式做法更加高效。自动化重构工具可以安全地处理相当复杂的改名、参数变更等情况。如果遇到类似这里的例子，尽管工具无法自动完成整个重构，还是可以更快、更安全地完成关键的提炼和内联步骤，从而简化整个重构过程。

## 6.6 封装变量（Encapsulate Variable)
曾用名：自封装字段（Self-Encapsulate Field）  
曾用名：封装字段（Encapsulate Field)  

### 动机 
重构的作用就是调整程序中的
如果想要搬移一处被广泛使用的数据，最好的办法往往就是先以函数形式封装所有对该数据的访问。  
对于所有可变的数据，只要它的作用域超出单个函数，我就会将其封装起来，只允许通过函数访问。数据的作用域越大，封装就越重要。 

### 做法 
+ 创建封装函数，在其中访问和更新变量值 
+ 执行静态检查 
+ 注意修改使用该变量的代码，将其改为调用合适的封装函数，每次替换之后，执行测试 
+ 限制变量的可见性 
+ 测试
+ 如果变量的值是一个记录，考虑使用封装记录 

### 范例 
> 封装前 
```js 
let defaultOwner = {firstName: "Martin", lastName: "Fowler"}; 
spaceship.owner = defaultOwner;

// 更新内容
defaultOwner = {firstName: "Rebecca", lastName: "Parsons"}; 
```

> 封装后 
```js 
let defaultOwnerData = {firstName: "Martin", lastName: "Fowler"}; 
export function defaultOwner() {
  return Object.assign({}, defaultOwnerData);
}

export function setDefaultOwner(arg) {
  defaultOwnerData = arg;
}

spaceship.owner1 = defaultOwner();
const owner2 = defaultOwner();
owner2.lastName = "Persons";
setDefaultOwner({firstName: "Rebecca", lastName: "Parsons"}); 

class Person {
  constructor(data) {
    this._lastName = data.lastName;
    this._firstName = data.firstName;
  }
  get lastName() {
    return this._lastName;
  }
  get firstName() {
    return this._firstName;
  }
  // and so on for other properties
}
```

如你所见，数据封装很有价值，但往往不简单。到底应该封装什么，以及如何封装，取决于数据被使用的方式，以及我们想要修改数据的方式。不过一言以蔽之，数据被使用得越广，就越是值得花精力给它一个体面的封装。

## 6.7 变量改名（Rename Variable）
### 动机 
好的命名是整洁编程的核心。变量可以很好地解释一段程序在干什么。 

### 机制 
+ 如果变量被广泛使用，考虑运用封装变量将其封装起来
+ 找出所有使用该变量的代码，逐一修改
+ 测试

### 范例 
> 修改前
```js
let tpHd = "untitled";
result += `<h1>${tpHd}</h1>`;
tpHd = obj['articleTitle'];

result += `<h1>${title()}</h1>`;

function title() {
  return tpHd;
}

function setTitle(arg) {
  tpHd = arg;
}
```

> 修改后
```js
let _title = "untitled";
result += `<h1>${_title}</h1>`;
_title = obj['articleTitle'];

result += `<h1>${title()}</h1>`;

function title() {
  return _title;
}

function setTitle(arg) {
  _title = arg;
}
```

## 6.8 引入参数对象（Introduce Parameter Object）

### 动机
将数据组织成结构是一件有价值的事，因为这让数据项之间的关系变得明晰。使用新的数据结构，函数的参数列表也能缩短。并且经过重构之后，所有使用该数据结构的函数都会通过同样的名字来访问其中的元素，从而提升代码的一致性。 
但这项重构真正的意义在于，它会催生代码中更层次的改变。 

### 做法
+ 如果暂时还没有一个合适的数据结构，就创建一个
+ 测试
+ 使用改变函数声明给原来的函数新增一个参数，类型是新建的数据结构
+ 测试
+ 调整所有调用者，传入新数据结构的适当实例。每修改一处，执行测试
+ 用新数据结构中的每项元素，逐一取代参数列表中与之对应的参数项，然后删除原来的参数。
+ 测试

### 范例
> 引入前
```js
const station = {
  name: "ZB1",
  readings: [
    { temp: 47, time: "2016-11-10 9:10" },
    { temp: 53, time: "2016-11-10 9:20" },
    { temp: 58, time: "2016-11-10 9:30" },
    { temp: 53, time: "2016-11-10 9:40" },
    { temp: 51, time: "2016-11-10 9:50" }
  ]
};

function readingsOutsideRange(station, min, max) {
  return station.readings.filter(r => r.temp < min || r.temp > max);
}

alerts = readingsOutsideRange(station, operatingPlan.temperatureFloor, operatingPlan.temperatureCeiling)
```

> 引入后
```js
class NumberRange {
  constructor(min, max) {
    this._data = { min: min, max: max };
  }
  get min() { return this._data.min; }
  get max() { return this._data.max; }
  contains(arg) { return (arg >= this.min && arg <= this.max); }
}

const station = {
  name: "ZB1",
  readings: [
    { temp: 47, time: "2016-11-10 9:10" },
    { temp: 53, time: "2016-11-10 9:20" },
    { temp: 58, time: "2016-11-10 9:30" },
    { temp: 53, time: "2016-11-10 9:40" },
    { temp: 51, time: "2016-11-10 9:50" }
  ]
};

function readingsOutsideRange(station, range) {
  return station.readings.filter(r => !range.contains(r.temp));
}

const range = new NumberRange(operatingPlan.temperatureFloor, operatingPlan.temperatureCeiling);
alerts = readingsOutsideRange(station, range);
```

## 6.9 函数组合成类（Combine Functions into Class）
### 动机
类，在大多数现代编程语言中都是基本的构造。它们把数据与函数捆绑到同一个环境中，将一部分数据与函数暴露给其他程序元素以便于写作。它们是面向对象语言的首要构造，在其他程序设计方法中也同样有用。   
将函数组织到一起的另一种方式是函数组合成变换。具体使用哪个重构手法，要看程序整体的上下文。使用类有一大好处：客户端可以修改对象的核心数据，通过计算得出的派生数据则会自动与核心数据保持一致。  
类似这样的一组函数不仅可以组合成一个类，而且可以组合成一个嵌套函数。通常我更倾向于类而非嵌套函数，因为后者测试起来会比较困难。   
在有些编程语言中，类不是一等公民，而函数则是。面对这样的语言，可以用“函数作为对象”的形式来实现这个符合重构的手法。
### 做法
+ 运用**封装记录**对多个函数共用的数据加以封装
+ 对于使用该记录结构的每个函数，运用**搬移函数**将其移入新类
+ 用以处理该数据记录的逻辑可以用**提炼函数**提炼出来，并移入新类
### 范例
> 修改前
```js
let reading = {customer: "ivan",quantity: 10, month: 5, year: 2023};

// Client 1
const aReading = acquireReading();
const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;

// Client 2
const aReading = acquireReading();
const base = baseRate(aReading.month, aReading.year) * aReading.quantity;
const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));

// Client 3
const aReading = acquireReading();
const base = calculateBaseCharge(aReading);
function calculateBaseCharge(aReading) {
  return baseRate(aReading.month, aReading.year) * aReading.quantity;
}
```

> 修改后
```js
class Reading {
  constructor(data) {
    this._customer = data.customer;
    this._quantity = data.quantity;
    this._month = data.month;
    this._year = data.year;
    get customer() {
      return this._customer;
    }
    get quantity() {
      return this._quantity;
    }
    get month() {
      return this._month;
    }
    get year() {
      return this._year;
    }
    get baseCharge() {
      return baseRate(this.month, this.year) * this.quantity;
    }
    get taxableCharge() {
      return Math.max(0, this.baseCharge - taxThreshold(this.year));
    }
  }
}

// Client 1
const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const baseCharge = aReading.baseCharge;

// Client 2
const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const taxableCharge = aReading.taxableCharge;


// Client 3
const rawReading = acquireReading();
const aReading = new Reading(rawReading);
const baseCharge = aReading.baseCharge;
```