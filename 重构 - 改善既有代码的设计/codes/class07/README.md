# 封装
数据结构无疑是最常见的一种秘密，我们可以用**封装记录**或者**封装集合**手法来隐藏它们的细节。即便是基本类型的数据，也能通过以**对象取代基本类型**进行封装 —— 这样做后续所带来的巨大收益通常令人惊喜。另一项经常在重构时挡道的是临时变量，这里**以查询取代临时变量**手法可以帮上大忙，特别是在分解一个过长的函数时。  

类是为隐藏信息而生的。  

除了类的内部细节，使用**隐藏委托关系**隐藏类之间的关联关系通常也狠有帮助。但过多隐藏也会导致冗余的中间接口，此时我们需要它的反向重构 —— **移除中间人**。  

类与模块已然是实行封装的最大实体了，但小一点的函数对于封装实现细节也有所裨益。有时，我们可能需要将一个算法完全替换掉，这里我们可以用**提炼函数**将算法包装到函数中，然后使用**替换算法**。

## 7.1 封装记录（Encapsulate Record）
曾用名：以数据类取代记录（Replace Record with Data Class）
### 动机
记录型结构是多数编程语言提供的一种常见特征。它们能直观地组织起存在关联的数据，让我们可以将数据作为有意义的单元传递，而不仅是一堆数据的拼凑。  
记录型结构可以有两种类型：一种需要声明合法的字段名字，另一种可以随便用任何字段名字。后者常由语言库本身实现，并通过类的形式提供出来，这些类称为散列（hash）、映射（map）、散列映射（hashmap）、字典（dictionary）或者关联数组（associative array）等。但使用这类结构也有缺陷，那就是一条记录上持有什么字段往往不够直观。若其使用范围变宽，“数据结构不直观”这个问题就会造成更多困扰。我们可以重构它，使其变得更直观——但如果真需要这样做，那还不如使用类来得直接。    
程序中间常常需要互相传递嵌套的列表（list）或散列映射结构，这些数据结构后续经常需要被序列化成JSON或者XML。这样的嵌套结构同样值得封装。  
### 做法
+ 对持有记录的变量使用封装变量，将其封装到一个函数中
+ 创建一个类，将记录包装起来，并将记录变量的值替换为该类的一个实例，然后在类上定义一个访问函数，用于返回原始的记录。修改封装变量的函数，令其使用这个访问函数 
+ 测试
+ 新建一个函数，让它返回该类的对象，而非那条原始的记录 
+ 对于该记录的每处使用点，将原先返回记录的函数调用替换为那个返回实例对象的函数调用。使用对象上的访问函数来获取数据的字段，如果该字段的访问函数还不存在，那就创建一个。每次更改之后运行测试 
+ 移除类对原始记录的访问函数，那个容易搜索的返回原始数据的函数也要一并删除。
+ 测试
+ 如果记录中的字段本身也是复杂结构，考虑对其再次应用封装记录或封装集合手法
### 范例
> 封装前
```js
const newName = 'Jay';
const organization = {name: "Acme Gooseberries", country: "GB"};
result += `<h1>${organization.name}</h1>`;
organization.name = newName;
```

> 封装后
+ 函数封装
```js
const newName = 'Jay';
const organization = {name: "Acme Gooseberries", country: "GB"};

// 函数封装
function getRawDataOfOrganization() {
  return organization;
}
result += `<h1>${getRawDataOfOrganization().name}</h1>`;
getRawDataOfOrganization().name = newName;
```
+ 类封装
```js
const newName = 'Jay';
// 类封装
class Organization {
  constructor(data) {
    this._data = data;
  }
  set name(aString) {
    this._data.name = aString;
  }
  get name() {
    return this._data.name;
  }
  set country(aCountryCode) {
    this._country = aCountryCode;
  }
  get country() {
    return this._country;
  }
}

const organization = new Organization({name: "Acme Gooseberries", country: "GB"});
// function getRawDataOfOrganization() {
//   return organization._data;
// }
function getOrganization() {
  return organization;
}
result += `<h1>${getOrganization().name}</h1>`;
getOrganization().name = newName;
```
### 范例：封装嵌套记录
```js
"1920": {
  name: "martin",
  id: "1920",
  usages: {
    "2022": {
      "1": 50,
      "2": 55,
      // remaining months of the year
    },
    "2023": {
      "1": 70,
      "2": 75,
      // remaining months of the year
    }
  }
},
"38673": {
  name: "neal",
  id: "38673",
  // more customers in a similar from
}
```
> 封装前
```js
customerData[customerId].usages[year][month] = amount;
function compareUsage(customerID, laterYear, month) {
  const later = customerData[customerId].usages[laterYear][month];
  const earlier = customerData[customerId].usages[laterYear - 1][month];
  return {laterAmount: later, change: later - earlier};
}

function getRawDataOfCustomers() {
  return customerData;
}

function setRawDataOfCustomers(arg) {
  customerData = arg;
}
```
> 封装后
```js
class CustomerData {
  constructor(data) {
    this._data = data;
  }
  setUsage(customerID, year, month, amount) {
    this._data[customerId].usages[year][month] = amount;
  }
  usage(customerID, year, month) {
    return this._data[customerId].usages[year][month];
  }
  get rawData() {
    // lodash库的cloneDeep
    return _.cloneDeep(this.data);
  }
}

function getCustomerData() {
  return customerData;
}
function getRawDataOfCustomers() {
  return customerData._data;
}

function setRawDataOfCustomers(arg) {
  customerData = new CustomerData(arg);
}

// 方案01：返回一份只读的数据代理。这种处理方式的好处就在于它为customerData提供了一份清晰的API列表，清楚免回了该类的全部用途。
function compareUsage(customerID, laterYear, month) {
  const later = getCustomerData().usage(customerID, laterYear, month);
  const earlier = getCustomerData().usage(customerID, laterYear - 1, month);
  return {laterAmount: later, change: later - earlier};
}

// 方案02： 返回原始数据的一份副本。这样子简单归简单，这种方案也有缺点。最明显的问题就是复制巨大的数据结构时代价颇高，这可能引发性能问题。
function compareUsage(customerID, laterYear, month) {
  const later = getCustomerData().rawData[customerID].usages[laterYear][month];
  const earlier = getCustomerData().rawData[customerID].usages[laterYear - 1][month];
  return {laterAmount: later, change: later - earlier};
}

// 另一种方案需要更多工作，但能提供更可靠的控制粒度：对每个字段循环应用封装记录。
```

## 7.2 封装集合（Encapsulate Collection）
### 动机
我们通常鼓励封装 —— 使用面向对象技术的开发者对封装尤为重视 —— 但封装集合时人们常常犯一个错误：只对集合变量的访问进行了封装，但依然让取值函数返回集合本身。这使得集合的成员变量可以直接被修改，而封装它的类则全然不止，无法接入。   
不要让集合的取值函数返回原始集合，不就避免了客户端的意外修改。   
避免直接修改集合的方法：
+ 永远不直接返回集合的值
+ 以某种形式限制集合的访问权，只允许对集合进行读操作。  

使用数据代理和数据复制的另一个区别是，对源数据的修改会反映到代理上，但不会反映到副本上。  
采用哪种方法并无定式，最重要的是在同个代码库中做法要保持一致。  
### 做法
+ 如果集合的引用尚未被封装起来，先用封装变量封装它
+ 在类上添加用于“添加集合元素”和“移除集合元素”的函数 
+ 执行静态检查
+ 查找集合的引用点。如果有调用者直接修改集合，令该处调用使用新的添加/移除元素的函数。每次修改后执行测试
+ 修改集合的取值函数，使其返回一份只读的数据，可以使用只读代理或数据副本
+ 测试
### 范例
```js
class Person {
  constructor(name) {
    this._name = name;
    this._courses = [];
  }
  get name() {
    return this._name;
  }
  get courses() {
    return this._courses;
  }
  set courses(aList) {
    return this._courses = aList;
  }
}

class Course {
  constructor(name, isAdvanced) {
    this._name = name;
    this._isAdvanced = isAdvanced;
  }
  get name() {
    return this._name;
  }
  get isAdvanced() {
    return this._isAdvanced;
  }
}

const basicCourseNames = readBasicCourseNames(filename);
aPerson.courses = basicCourseNames.map(name => new Course(name, false));
for(const name of basicCourseNames) {
  aPerson.courses.push(new Course(name, false));
}
```
> 封装后
```js
class Person {
  constructor(name) {
    this._name = name;
    this._courses = [];
  }
  get name() {
    return this._name;
  }
  get courses() {
    return this._courses.slice();
  }
  set courses(aList) {
    return this._courses = aList.slice();
  }
  addCourse(aCourse) {
    this._courses.push(aCourse);
  }
  removeCourse(aCourse, fnIfAbsent = () => {throw new RangeError();}) {
    const index = this._courses.indexOf(aCourse);
    if (index === -1) fnIfAbsent();
    else this._courses.splice(index, 1);
  }
}

class Course {
  constructor(name, isAdvanced) {
    this._name = name;
    this._isAdvanced = isAdvanced;
  }
  get name() {
    return this._name;
  }
  get isAdvanced() {
    return this._isAdvanced;
  }
}

const basicCourseNames = readBasicCourseNames(filename);
aPerson.courses = basicCourseNames.map(name => new Course(name, false));
for(const name of basicCourseNames) {
  aPerson.addCourse(new Course(name, false));
}
```

## 7.3 以对象取代基本类型（Replace Primitive with Object）
曾用名：以对象取代数据值（Replace Data Value with Object）
曾用名：以类取代类型码（Replace Type Code with Class）

### 动机
一旦我发现对某个数据的操作不仅仅局限于打印时，我就会为它创建一个新类。创建新类无须太大的工作量，但我们发现他们往往对代码库有深远的影响。  
### 做法
+ 如果变量尚未被封装起来，先使用封装变量封装它
+ 为这个数据值创建一个简单的类。类的构造函数应该保存这个数据值，并为它提供一个取值函数
+ 执行静态检查
+ 修改第一步得到的设值函数，令其创建一个新类的对象并将其存入字段，如果有必要的话，同时修改字段的类型声明
+ 修改取值函数，令其调用新类的取值函数，并返回结果
+ 测试
+ 考虑对第一步得到的访问函数使用函数改名，以便更好反映用途
+ 考虑应用将引用对象改为值对象或将值对象改为引用对象，明确指出新对象的角色是值对象还是引用对象
### 范例
> 封装前
```js
class Order {
  constructor(data) {
    this.priority = data.priority;
    // more initialization
  }
}

highPriorityCount = orders.filter(0 => 'high' === o.priority || 'rush' === o.priority).length;
```
> 封装后
```js
class Priority {
  constructor(value) {
    if (value instanceof Priority) return value;
    if (Priority.legalValues().includes(value))
      this._value = value;
    else 
      throw new Error(`<${value}> is invalid for Priority`);
  }
  toString() {
    return this._value;
  }
  get _index() {
    return Priority.legalValues().findIndex(s => s === this._value);
  }
  static legalValues() {
    return ['low', 'normal', 'high', 'rush'];
  }
  equals(other) {
    return this._index === other._index;
  }
  higherThan(other) {
    return this._index > other._index;
  }
  lowerThan(other) {
    return this._index < other._index;
  }
}
class Order {
  constructor(data) {
    this.priority = data.priority;
    // more initialization
  }
  // 封装变量
  get priority() { return this._priority; }
  get priorityString() { return this._priority.toString(); }
  set priority(aString) { this._priority = new Priority(aString); }
}

highPriorityCount = orders.filter(0 => o.priority.higherThan(new Priority('normal'))).length;
```

## 7.4 以查询取代临时变量（Replace Temp with Query）
### 动机
临时变量的一个作用是保存某段代码的返回值，以便在函数的后面部分使用它。   
以查询取代临时变量手法只适用于处理某些类型的临时变量：那些只被计算一次且之后不再被修改的变量。
### 做法
+ 检查变量在使用前是否已经完全计算完毕，检查计算它的那段代码是否每次都能得到一样的值
+ 如果变量目前不是只读的，但是可以改造成只读变量，那就先改造它
+ 测试
+ 将为变量赋值的代码段提炼成函数
+ 测试
+ 应用内联变量手法移除临时变量
### 范例
> 封装前
```js
class Order {
  constructor(quantity， item) {
    this._quantity = quantity;
    this._item = item;
  }
  get price() {
    var basePrice = this._quantity * this._item.price;
    var discountFactor = 0.98;
    if (basePrice > 1000) discountFactor -= 0.03;
    return basePrice * discountFactor;
  }
}
```
> 封装后
```js
class Order {
  constructor(quantity， item) {
    this._quantity = quantity;
    this._item = item;
  }
  get price() {
    return this.basePrice * this.discountFactor;
  }
  get basePrice() {
    return this._quantity * this._item.price;
  }
  get discountFactor() {
    const discountFactor = 0.98;
    if (this.basePrice > 1000) discountFactor -= 0.03;
    return discountFactor;
  }
}
```

## 7.5 提炼类（Extract CLass）
反向重构：内联类
### 动机
在维护一个有大量函数和数据的类中，我们往往需要考虑将哪些部分分离出来，并将它们分离到一个独立的类中。 
### 做法
+ 决定如何分解类所负的责任
+ 创建一个新的类，用以表现从旧类中分离出来的责任
+ 构造旧类时创建一个新类的实例，建立“从旧类访问新类”的连接关系
+ 对于你想搬移的每一个字段，运用搬移字段搬移它。每次更改后运行测试
+ 使用搬移函数将必要函数搬移到新类。先搬移较低层函数（也就是“被其他函数调用”多余“调用其他函数”者）。每次更改后运行测试
+ 检查两个类的接口，去掉不再需要的函数，必要时为函数重新取一个适合新环境的名字
+ 决定是否公开新的类。如果确实需要，考虑对新类应用将引用对象改为值对象使其成为一个值对象
### 范例
> 提炼前
```js
class Person {
  get name() {
    return this._name;
  }
  set name(arg) {
    this._name = arg;
  }
  get telephoneNumber() {
    return `(${this.officeAreaCode}) ${this.officeNumber}`;
  }
  get officeAreaCode() {
    return this._officeAreaCode;
  } 
  set officeAreaCode(arg) {
    this._officeAreaCode = arg;
  }
  get officeNumber() {
    return this._officeNumber;
  } 
  set officeNumber(arg) {
    this._officeNumber = arg;
  }
}
```

> 提炼后
```js
class Person {
  constructor() {
    this._telephoneNumber = new TelephoneNumber();
  }
  get name() {
    return this._name;
  }
  set name(arg) {
    this._name = arg;
  }
  get telephoneNumber() {
    return this._telephoneNumber.toString();
  }
  get officeAreaCode() {
    return this._telephoneNumber.officeAreaCode;
  } 
  set officeAreaCode(arg) {
    this._telephoneNumber.officeAreaCode = arg;
  }
  get officeNumber() {
    return this._telephoneNumber.number;
  } 
  set officeNumber(arg) {
    this._telephoneNumber.number = arg;
  }
}

class TelephoneNumber {
  toString() {
    return `(${this.areaCode}) ${this.number}`;
  }
  get areaCode() {
    return this._areaCode;
  } 
  set areaCode(arg) {
    this._areaCode = arg;
  }
  get number() {
    return this._number;
  } 
  set number(arg) {
    this._number = arg;
  }
}
```

## 7.6 内联类（Inline Class）
反向重构：提炼类
### 动机
内联类与提炼类相反。
重新组织代码时常用的手法：有时把相关元素一口气搬移到位更简单，但有时先用内联手法合并各自的上下文，再使用提炼手法再次分离他们更合适。
### 做法
+ 对于待内联类（源类）中的所有public函数，在目标类上创建一个对应的函数，新创建的所有函数应该直接委托至源类
+ 修改源类public方法的所有引用点，令它们调用目标类对应的委托方法。每次更改后运行测试
+ 将源类中的函数与数据全部搬移到目标类，每次修改之后进行测试，直到源类编程空壳为止
+ 删除源类
### 范例
> 修改前
```js
class TrackingInformation {
  get shippingCompany() {
    return this._shippingCompany;
  }
  set shippingCompany(arg) {
    this._shippingCompany = arg;
  }
  get trackingNumber() {
    return this._trackingNumber;
  }
  set trackingNumber(arg) {
    this._trackingNumber = arg;
  }
  get display() {
    return `${this.shippingCompany}: ${this.trackingNumber}`;
  }
}

class Shipment {
  get trackingInfo() {
    return this._trackingInformation.display;
  }
  get trackingInformation() {
    return this._trackingInformation;
  }
  set trackingInformation(aTrackingInformation) {
    this._trackingInformation = aTrackingInformation;
  }
}
aShipment.trackingInformation.shippingCompany = request.vendor;
```
> 修改后
```js
class TrackingInformation {
  get display() {
    return `${this.shippingCompany}: ${this.trackingNumber}`;
  }
  get shippingCompany() {
    return this._shippingCompany;
  }
  set shippingCompany(arg) {
    this._shippingCompany = arg;
  }
  get trackingNumber() {
    return this._trackingNumber;
  }
  set trackingNumber(arg) {
    this._trackingNumber = arg;
  }
}

class Shipment {
  get trackingInfo() {
    return `${this.shippingCompany}: ${this.trackingNumber}`;
  }
  get shippingCompany(arg) {
    return this._shippingCompany;
  }
  set shippingCompany(arg) {
    this._shippingCompany = arg;
  }
  get trackingNumber() {
    return this._trackingNumber;
  }
  set trackingNumber(arg) {
    this._trackingNumber = arg;
  }
}
aShipment.shippingCompany = request.vendor;
```
## 7.7 隐藏委托关系（Hide Delegate）
反向重构：移除中间人
### 动机
一个好的模块化的设计，“封装”是最关键特征之一。“封装”意味着每个模块都应该尽可能少了解系统的其他部分。 
我们可以在服务对象上放置一个简单的委托函数，将委托关系隐藏起来，从而去除这种依赖。  
### 做法
+ 对于每个委托关系中的函数，在服务对象端建立一个简单的委托函数
+ 调整客户端，令它只调用服务对象提供的函数。每次调整后运行测试
+ 如果将来不再有任何客户端需要取用Delegate（受托类），便可移除服务对象中的相关访问函数
+ 测试
### 范例
> 修改前
```js
class Person {
  constructor(name) {
    this._name = name;
  }
  get name() {
    return this._name;
  }
  get department() {
    return this._department;
  }
  set department(arg) {
    this._department = arg;
  }
}

class Department {
  get chargeCode() {
    return this._chargeCode;
  }
  set chargeCode(arg) {
    this._chargeCode = arg;
  }
  get manager() {
    return this._manager;
  }
  set manager(arg) {
    this._manager = arg;
  }
}
manager = aPerson.department.manager;
```
> 修改后
```js
class Person {
  constructor(name) {
    this._name = name;
  }
  get name() {
    return this._name;
  }
  get department() {
    return this._department;
  }
  set department(arg) {
    this._department = arg;
  }
  get manager() {
    return this._department.manager;
  } 
}

class Department {
  get chargeCode() {
    return this._chargeCode;
  }
  set chargeCode(arg) {
    this._chargeCode = arg;
  }
  get manager() {
    return this._manager;
  }
  set manager(arg) {
    this._manager = arg;
  }
}
manager = aPerson.manager;
```
8 移除中间人（Remove Middle Man）
反向重构：隐藏委托关系
### 动机
每当客户端要使用受托类的新特性时，你就必须在服务端添加一个简单委托函数。随着受托类的新特性时，你就必须再服务端添加一个简单委托函数。随着受托类的特性（功能）越来越多，更多的转发函数就会使人烦躁。
### 做法
+ 为受托对象创建一个取值函数
+ 对于每个委托函数，让其客户端转为连续的访问函数调用。每次替换后运行测试
### 范例
> 修改前
```js
class Person {
  get department() {
    return this._department;
  }
  set department(arg) {
    this._department = arg;
  }
  get manager() {
    return this._department.manager;
  } 
}
class Department {
  get manager() {
    return this._manager;
  }
}
manager = aPerson.department.manager;
```
> 修改后
```js
class Person {
  get department() {
    return this._department;
  }
  set department(arg) {
    this._department = arg;
  }
  get manager() {
    return this.department.manager;
  } 
}
class Department {
  get manager() {
    return this._manager;
  }
}
manager = aPerson.department.manager;
```

## 7.9 替换算法（Substitute Algorithm）
### 动机
在原先的做法之外，有更简单的解决方案，此时我们需要改变原先的算法。
### 做法
+ 整理一下待替换的算法，保证它已经被抽取到一个独立的函数中
+ 先只为这个函数准备测试，以便固定它的行为
+ 准备好另一个（替换用）算法
+ 执行静态检查
+ 运行测试，比对新旧算法的运行结果。如果测试通过，那就大功告成；否则，在后续测试和调试过程中，以旧算法为比较参照标准。