module.exports = {
  "moduleFileExtensions": [
    "js",
    "json",
    // 告诉 Jest 处理 `*.vue` 文件
    "vue"
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.vue?$": "vue-jest",
    "^.+\\.tsx?$": "ts-jest",
  }
}