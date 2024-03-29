# 8 搬移特性
重构手法：
+ 新建、移除或重命名程序的元素
+ 在不同的上下文之间搬移元素  
我们通过搬移函数手法在类与其他模块之间搬移函数，对于字段可用搬移字段手法做类似的搬移。  
搬移语句到函数和搬移语句到调用者可用于将语句搬入函数或从函数中搬出；如果需要在函数内部调整语句的顺序，那么移动语句就能派上用场。有时候一些语句做的事已有现成的函数代替，那时我们就能以函数调用取代内联代码消除重复。  
对付循环，我们有两个常用的手法：
+ 拆分循环
+ 移除死代码
## 8.1 搬移函数（Move Function）
曾用名：搬移函数（Move Method）
### 动机
模块化是优秀软件设计的核心所在，好的模块化能够让我们在修改程序时只需理解程序的一小部分。为了设计出高度模块化的程序，我们得保证互相关联的软件要素都能集中到一块，并确保块与块之间的联系易于查找、直观易懂。同时，我们对模块设计的理解并不是一成不变的。要将这种理解反映到代码上，就得不断地搬移这些元素。  
搬移函数最直接的一个动因是，它频繁引用其他上下文中的元素，而对自身上下文中的元素却关心甚少。  
先把函数安置到某一个上下文里去，这样我们就能发现它们是否契合，如果不太适合我们可以再把函数搬移到别的地方。  
### 做法
+ 检查函数在当前上下文里引用的所有元素（包含变量和函数），考虑是否需要将它们一并搬移
+ 检查待搬移函数是否具有多态性
+ 将函数复制一份到目标上下文中。调整函数，使它能适应新家
+ 执行静态检查
+ 设法从源上下文中正确引用目标函数
+ 修改源函数，使之成为一个纯委托函数
+ 测试
+ 考虑对源函数使用内联函数
### 范例：搬移内嵌函数到顶层
> 搬移前
```js
function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
    time: totalTime,
    distance: totalDistance,
    pace: pace
  }

  function calculateDistance() {
    let result = 0;
    for (let i = 0; i < points.length; i++) {
      result += distance(points[i - 1], points[i]);
    }
    return result;
  }
  function distance(p1, p2) { ... }
  function radians(degrees) { ... }
  function calculateTime() { ... }
}
```
> 搬移后
```js
function trackSummary(points) {
  const totalTime = calculateTime();
  const pace = totalTime / 60 / totalDistance(points);
  return {
    time: totalTime,
    distance: totalDistance(points),
    pace: pace
  }
  function calculateTime() { ... }
}
// 函数复制一份到顶层作用域
function totalDistance(points) {
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    result += distance(points[i - 1], points[i]);
  }
  return result;
}
function distance(p1, p2) {
  const EARTH_RADIUS = 3959; // in miles
  const dLat = radians(p2.lat) - radians(p1.lat);
  const dLon = radians(p2.lon) - radians(p1.lon);
  const a = Math.pow(Math.sin(dLat / 2), 2)
    + Math.cos(radians(p2.lat))
    + Math.cos(radians(p1.lat))
    + Math.pow(Math.sin((dLon) / 2), 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return EARTH_RADIUS * c;
}
function radians(degrees) {
  return degrees * Math.PI / 180;
}
```
### 范例：在类之间搬移函数
> 搬移前
```js
class Account {
  get bankCharge() {
    let result = 4.5;
    if (this._daysOverdrawn > 0)
      result += this.type.overdraftCharge(this.daysOverdrawn);
    return result;
  }
  get overdraftCharge() {
    if (this.type.isPremium) {
      const baseCharge = 10;
      if (this.daysOverdrawn <= 7)
        return baseCharge;
      else
        return baseCharge + (this.daysOverdrawn - 7) * 0.85;
    } else {
      return this.daysOverdrawn * 1.75;
    }
  }
}
```
> 搬移后
```js
class Account {
  get bankCharge() {
    let result = 4.5;
    if (this._daysOverdrawn > 0)
      result += this.overdraftCharge;
    return result;
  }
  get overdraftCharge() {
    return this.type.overdraftCharge(this);
  }
}

class AccountType {
  overdraftCharge(account) {
    if (this.isPremium) {
      const baseCharge = 10;
      if (account.daysOverdrawn <= 7)
        return baseCharge;
      else
        return baseCharge + (account.daysOverdrawn - 7) * 0.85;
    } else {
      return account.daysOverdrawn * 1.75;
    }
  }
}
```

## 8.2 搬移字段（Move Field）
### 动机
编程活动中你需要编写许多代码，为系统实现特定的行为，但往往数据结构才是一个健壮程序的根基。一个适应于问题域的良好数据结构，可以让行为代码变得简单明了，而一个糟糕的数据结构则将招致许多无用代码。  
### 做法
+ 确保源字段已经得到了良好封装
+ 测试
+ 在目标对象上创建一个字段（及对应的访问函数）
+ 执行静态检查
+ 确保源对象里能够正常引用目标对象
+ 调整源对象的访问函数，令其使用目标对象的字段
+ 测试
+ 移除源对象上的字段
+ 测试
### 范例
> 搬移前
```js
class Customer {
  constructor(name, discountRate) {
    this._name = name;
    this._discountRate = discountRate;
    this._contract = new CustomerContract(dateToday());
  }
  get discountRate() {
    return this._discountRate;
  }
  becomePreferred() {
    this._discountRate += 0.03;
    // other nice things
  }
  applyDiscount(amount) {
    return amount.subtract(amount.multiply(this._discountRate));
  }
}

class CustomerContract {
  this._startDate = startDate;
}
```
> 搬移后
```js
class Customer {
  constructor(name, discountRate) {
    this._name = name;
    this._setDiscountRate(discountRate);
    this._contract = new CustomerContract(dateToday());
  }
  get discountRate() {
    return this._contract._discountRate;
  }
  _setDiscountRate(aNumber) {
    this._contract._discountRate = aNumber;
  }
  becomePreferred() {
    this._setDiscountRate(this._discountRate + 0.03);
    // other nice things
  }
  applyDiscount(amount) {
    return amount.subtract(amount.multiply(this.discountRate));
  }
}

class CustomerContract {
  this._startDate = startDate;
  this._discountRate = discountRate;
  get discountRate() {
    return this._discountRate;
  }
  set discountRate(arg) {
    this._discountRate = arg;
  }
}
```
### 搬移裸记录
如果我们要搬移的字段是裸记录，并且被许多函数直接访问，那么这项重构仍然很有意义，只不过情况会复杂不少。  
### 范例：搬移字段到共享对象
> 搬移前
```js
class Account {
  this._number = number;
  this._type = type;
  this._interestRate = interestRate;
  get interestRate() {
    return this._interestRate;
  }
}

class AccountType {
  constructor(nameString) {
    this._name = nameString;
  }
}
```
> 搬移后
```js
class Account {
  this._number = number;
  this._type = type;
  assert(interestRate === this._type.interestRate);
  this._interestRate = interestRate;
  get interestRate() {
    return this._type._interestRate;
  }
}

class AccountType {
  constructor(nameString) {
    this._name = nameString;
  }
}
```

## 8.3 搬移语句到函数（Move Statements into Function）
反向重构：搬移语句到调用者
### 动机
要维护代码库的健康发展，需要遵守几条黄金守则，其中最重要的一条当属“消除重复”。 
### 做法
+ 如果重复的代码段离调用目标函数的地方还有些距离，则先用移动语句将这些语句挪动到紧邻目标函数的位置
+ 如果目标函数仅被唯一一个源函数调用，那么只需将源函数中的重复代码段剪切并粘贴到目标函数中即可，然后运行测试。本做法的后续步骤至此可以忽略
+ 如果函数不止第一个调用点，那么先选择其中一个调用点应用提炼函数，将待搬移的语句与目标函数一起提炼成新函数。给新函数取个临时的名字，只要易于搜索即可
+ 调整函数的其他调用点，令他们调用新提炼的函数。每次调整之后运行测试
+ 完成所有引用点的替换后，应用内联函数将目标函数内联到新函数里，并移除原目标函数
+ 对新函数应用函数改名，将其改名为原目标函数的名字
### 范例
> 搬移前
```js
function renderPerson(outStream, person) {
  const result = [];
  result.push(`<p>${person.name}</p>`);
  result.push(renderPhoto(person.photo));
  result.push(`<p>title: ${person.photo.title}</p>`);
  result.push(emitPhotoData(person.photo));
  return result.join('\n');
}

function photoDiv(p) {
  return [
    "<div>",
    `<p>title: ${p.title}</p>`,
    emitPhotoData(p),
    "</div>"
  ].join('\n');
}

function emitPhotoData(aPhoto) {
  const result = [];
  result.push(`<p>location: ${aPhoto.location}</p>`);
  result.push(`<p>date: ${aPhoto.date.toDateString}</p>`);
  return result.join('\n');
}
```
> 搬移后
```js
function renderPerson(outStream, person) {
  const result = [];
  result.push(`<p>${person.name}</p>`);
  result.push(renderPhoto(person.photo));
  result.push(emitPhotoData(person.photo));
  return result.join('\n');
}

function photoDiv(aPhoto) {
  return [
    "<div>",
    emitPhotoData(aPhoto),
    "</div>"
  ].join('\n');
}

function emitPhotoData(aPhoto) {
  return [
    `<p>title: ${aPhoto.title}</p>`,
    `<p>location: ${aPhoto.location}</p>`,
    `<p>date: ${aPhoto.date.toDateString}</p>`
  ].join('\n');
}
```

## 8.4 搬移语句到调用者（Move Statements to Callers）
反向重构：搬移语句到函数
### 动机
作为程序员，我们的职责就是设计出结构一致、抽象合宜的程序，而程序抽象能力的源泉正是来自函数。随着系统能力发生演进，原先设定的抽象边界总会悄无声息地发生偏移。对于函数来说，这样的边界偏移意味着曾经视为一个整体、一个单元的行为，如今可能已经分化出两个甚至多个不同的关注点。  
函数边界发生偏移的一个征兆是，以往在多个地方共用的行为，如今需要在某些调用点面前表现出不同的行为。  
这种重构手法比较适合处理边界仅有些许偏移的场景，但有时调用点和调用者之间的边界已经相去甚远。最好的方法是先用内联函数合并双方的内容，调整语句的顺序，再提炼出新的函数来，以形成更合适的边界。
### 做法
+ 最简单的情况下，原函数非常简单，其调用者也只有寥寥一两个，此时只需把要搬移的代码从函数里剪切出来并粘贴回调用端去即可，必要的时候做些调整。运行测试，如果测试通过，那就大功告成，本手法可以到此为止。
+ 若调用点不止一两个，则需要先用提炼函数将你不想搬移的代码提炼成一个新函数，函数名可以临时起一个，只要后续容易搜索即可
+ 对原函数应用内联函数
+ 对提炼出来的函数应用改变函数声明，令其与原函数使用同一个名字。如果有更好的名字，就用更好的那个  
### 范例
> 搬移前
```js
function renderPerson(outStream, person) {
  outStream.write(`<p>${person.name}</p>`);
  renderPhoto(outStream, person.photo);
  emitPhotoData(outStream, person.photo);
}

function listRecentPhotos(outStream, photos) {
  photos.filter(p => p.date > recentDateCutoff())
    .forEach(p => {
      outStream.write("<div>\n");
      emitPhotoData(outStream, p);
      outStream.write("</div>\n");
    });
}

function emitPhotoData(outStream, photo) {
  outStream.write(`<p>title: ${photo.title}</p>\n`);
  outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
  outStream.write(`<p>location: ${photo.location}</p>\n`);
}
```
> 搬移后
```js
function renderPerson(outStream, person) {
  outStream.write(`<p>${person.name}</p>`);
  renderPhoto(outStream, person.photo);
  emitPhotoData(outStream, photo);
  outStream.write(`<p>location: ${photo.location}</p>\n`);
}

function listRecentPhotos(outStream, photos) {
  photos.filter(p => p.date > recentDateCutoff())
    .forEach(p => {
      outStream.write("<div>\n");
      emitPhotoData(outStream, photo);
      outStream.write(`<p>location: ${photo.location}</p>\n`);
      outStream.write("</div>\n");
    });
}

function emitPhotoData(outStream, photo) {
  outStream.write(`<p>title: ${photo.title}</p>\n`);
  outStream.write(`<p>date: ${photo.date.toDateString()}</p>\n`);
}
```

## 8.5 以函数调用取代内联代码（Replace Inline Code with Function Call）
### 动机
善用函数可以帮助我们将相关的行为打包起来，这对于提升代码的表达力大有裨益。
### 做法
+ 将内联代码替代为一个既有函数的调用
+ 测试

## 8.6 移动语句（Slide Statements）
曾用名：合并重复的代码片段（Consolidate Duplicate Conditional Fragments）
### 动机
让存在关联的东西一起出现，可以使代码更容易理解。 
### 做法
+ 确定待移动的代码片段应该被搬往何处。
+ 剪切源代码片段，粘贴到上一步选定的位置上
+ 测试
### 范例：包含条件逻辑的移动
```js
let result;
if (availableResources.length === 0) {
  result = createResource();
  allocatedResources.push(result);
} else {
  result = allocatedResources.pop();
  allocatedResources.push(result);
}
return result;
```

```js
let result;
if (availableResources.length === 0) {
  result = createResource();
} else {
  result = allocatedResources.pop();
}
allocatedResources.push(result);
return result;
```
### 延伸阅读
除了此法，还有一个十分相似的手法，名字叫做“交换语句位置”。该手法同样适用于移动相邻的代码片段，只不过它适用的是只有一条语句的片段。

## 8.7 拆分循环（Split Loop）
### 动机
拆分循环还能让每个循环更容易适用。  
即使处理的列表数据更多一些，循环本身也很少成为性能瓶颈，更何况拆分出循环来通常还使一些更强大的优化手段变得可能。  
### 做法
+ 复制一遍循环代码
+ 识别并移除循环中的重复代码，使每个循环只做一件事
+ 测试  
完成循环拆分后，考虑对得到的每个循环应用提炼函数
### 范例
> 拆分前
```js
let youngest = people[0] ? people[0].age : Infinity;
let totalSalary = 0;
for (const p of people) {
  if (p.age < youngest) youngest = p.age;
  totalSalary += p.salary;
}
return `youngestAge: ${youngest}, totalSalary: ${totalSalary}`;
```

> 拆分后
```js
let totalSalary = 0;
for (const p of people) {
  totalSalary += p.salary;
}
let youngest = people[0] ? people[0].age : Infinity;
for (const p of people) {
  if (p.age < youngest) youngest = p.age;
}
return `youngestAge: ${youngestAge()}, totalSalary: ${totalSalary()}`;

function totalSalary() {
  return people.reduce((total, p) => total + p.salary, 0);
}
function youngestAge() {
  return Math.min(...people.map(p => p.age));
}
```
## 8.8 以管道取代循环（Replace Loop with Pipeline）
### 动机
如今越来越多的编程语言都提供了更好的语言结构来处理迭代过程，这种结构就叫作集合管道（Collection pipeline）。  
一些逻辑如果采用集合管道来编写，代码的可读性会更强 —— 我们只消从头到尾阅读一遍代码，就能弄清对象在管道中间的变换过程。  
### 做法
+ 创建一个新变量，用以存放参与循环过程的集合
+ 从循环顶部开始，将循环里的每一块行为依次搬移出来，在上一步创建的集合变量上用一种管道运算替代之。每次修改后运行测试
+ 搬移完循环里的全部行为后，将循环整个删除
### 范例
> 取代前
```js
function acquireData(input) {
  const lines = input.split("\n");
  let firstLine = true;
  const result = [];
  for (const line of lines) {
    if (firstLine) {
      firstLine = false;
      continue;
    }
    if (line.trim() === "") continue;
    const record = line.split(",");
    if (record[1].trim() === "India") {
      result.push({city: record[0].trim(), phone: record[2].trim()})
    }
  }
  return result;
}
```
> 取代后
```js
function acquireData(input) {
  const lines = input.split("\n");
  const result = lines
    .slice(1)
    .filter(line => line.trim() !== "")
    .map(line => line.split(","))
    .filter(record => record[1].trim() === "India")
    .map(record => ({city: record[0].trim(), phone: record[2].trim()}));
  return result;
}
```

## 8.9 移除死代码（Remove Dead Code）
### 动机
事实上，我们部署到生产环境甚至是用户设备上的代码，从来未因代码量太大而产生额外费用。就算是几行用不上的代码，似乎也不会因此拖慢系统进度，或者占用过多内存，大多数现代编译器还会自动将无用代码移除。  
一旦代码不再被使用，我们就该立马删除它。
### 做法
+ 如果死代码可以从外部直接引用，比如它是一个独立的函数时，先查找一下还有无调用点
+ 将死代码移除
+ 测试