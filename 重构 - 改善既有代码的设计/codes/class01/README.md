# 1 重构的第一个示例
> 如果想给程序添加一个特性，但发现代码因缺乏良好的结构而不易于进行更改，
> 那就先重构这个程序，使其比较容易添加该特性，然后再添加该特性。

## 重构的第一步
  重构前，先检查自己是否有一套可靠的测试集。这些测试必须有自我检验的能力。

## 重构的精髓
  小步修改，每次修改后就运行测试。
  重构技术就是以微小的步伐修改程序。如果你犯下错误，很容易便可发现它。

## 重构的要求
  傻瓜都能写出计算机可以理解的代码。唯有能写出人类容易理解的代码的，才是优秀的程序员。

## 问题
  对于重构过程中的性能问题，总体建议是大多数情况下可以忽略它，如果重构引入了性能损耗，先完成重构，再做性能优化。

  编程时，需要遵循营地法则：保证你离开时的代码库一定比来时更健康。

## 结语
  好代码的检验标准就是人们是否能轻而易举地修改它。