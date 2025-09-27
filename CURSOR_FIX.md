# 光标消失问题修复方案

## 问题描述
用户反馈：输入金额时光标会消失一下，影响输入体验。

## 问题原因
1. **频繁的setData调用**：每次输入都触发setData，导致input组件重新渲染
2. **组件重新渲染**：setData会使input失去焦点，造成光标闪烁或消失
3. **缺少输入优化**：没有判断值是否真正发生变化

## 解决方案

### 1. 优化输入处理逻辑 ⚡
**核心改进**：只在值真正变化时才调用setData

```javascript
onAmountInput(e) {
  let value = e.detail.value;
  
  // 处理输入值
  const filteredValue = value.replace(/[^\d.]/g, '');
  // ... 其他处理逻辑
  
  // 关键：只有当值真正改变时才更新数据
  if (finalValue !== this.data.amount) {
    console.log('值发生变化，更新:', this.data.amount, '->', finalValue);
    this.setData({
      amount: finalValue
    });
  } else {
    console.log('值未变化，跳过更新');
  }
}
```

### 2. CSS优化 🎨
**添加硬件加速**：防止重渲染时的性能问题

```css
.amount-input {
  /* 防止重渲染时光标消失 */
  will-change: auto;
  transform: translateZ(0);
  /* ... 其他样式 */
}
```

### 3. WXML属性优化 📝
**添加稳定性属性**：

```xml
<input class="amount-input"
       cursor-spacing="50"
       adjust-position="{{false}}"
       <!-- 其他属性 --> />
```

- `cursor-spacing="50"`：设置光标与键盘的距离，避免位置调整
- `adjust-position="{{false}}"` ：禁止自动调整位置，保持稳定

## 技术原理
1. **减少DOM操作**：通过值比较避免不必要的setData
2. **硬件加速**：使用CSS transform触发GPU加速
3. **位置稳定**：防止键盘弹出时的位置自动调整

## 测试要点
- ✅ 连续输入数字：光标应保持稳定
- ✅ 快速输入：不应出现闪烁
- ✅ 删除字符：光标位置正确
- ✅ 输入小数点：光标不消失

## 预期效果
- 🎯 输入流畅，无光标闪烁
- 🎯 性能提升，减少重渲染
- 🎯 用户体验优化

修复完成！现在输入时光标应该保持稳定，不再消失。