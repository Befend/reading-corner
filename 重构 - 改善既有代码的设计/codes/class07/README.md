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

