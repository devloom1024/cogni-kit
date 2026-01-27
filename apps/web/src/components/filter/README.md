# Filter Components

通用的过滤组件库，提供统一的过滤 UI 和交互体验。

## 组件列表

### FilterDropdown

一个功能完整的下拉过滤组件，支持多选、搜索、清除等功能。

#### 特性

- ✅ **多选支持**：使用 Checkbox 进行多项选择
- ✅ **搜索功能**：内置搜索框快速定位选项
- ✅ **一键清除**：菜单底部提供清除按钮
- ✅ **Tag 显示**：在按钮上显示选中的标签
- ✅ **虚线边框**：可选的虚线边框样式
- ✅ **自定义图标**：支持自定义左侧图标
- ✅ **垂直分隔线**：文字和 tag 之间自动添加分隔线
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **国际化**：支持多语言

#### API

```typescript
interface FilterOption {
  value: string        // 选项值
  label: string        // 显示文本
  icon?: ReactNode     // 可选图标
}

interface FilterDropdownProps {
  // 基础配置
  label: string                          // 按钮文字
  options: FilterOption[]                // 可选项列表
  value: string[]                        // 当前选中值
  onChange: (value: string[]) => void    // 值变化回调
  
  // 功能开关
  searchable?: boolean                   // 是否显示搜索框（默认 true）
  clearable?: boolean                    // 是否显示清除按钮（默认 true）
  showSelectedTags?: boolean             // 是否显示选中的 tag（默认 true）
  
  // 自定义文本
  placeholder?: string                   // 菜单标题
  emptyText?: string                     // 无结果提示（默认 "No results found"）
  clearText?: string                     // 清除按钮文字（默认 "Clear filters"）
  searchPlaceholder?: string             // 搜索框占位符（默认 "Search..."）
  
  // 样式配置
  variant?: 'default' | 'dashed'         // 按钮样式（默认 'dashed'）
  icon?: ReactNode                       // 左侧图标（默认为 Plus 图标）
  maxTagsDisplay?: number                // 最多显示几个 tag（默认 2）
  
  // 其他
  className?: string                     // 额外的 CSS 类名
  align?: 'start' | 'center' | 'end'     // 菜单对齐方式（默认 'start'）
}
```

#### 使用示例

##### 基础用法

```tsx
import { FilterDropdown } from '@/components/filter'

function MyComponent() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  
  const options = [
    { value: 'stock', label: '股票' },
    { value: 'etf', label: 'ETF' },
    { value: 'fund', label: '基金' },
  ]
  
  return (
    <FilterDropdown
      label="类型"
      options={options}
      value={selectedTypes}
      onChange={setSelectedTypes}
    />
  )
}
```

##### 完整配置

```tsx
import { FilterDropdown } from '@/components/filter'
import { Filter } from 'lucide-react'

function AdvancedFilter() {
  const [selected, setSelected] = useState<string[]>([])
  
  return (
    <FilterDropdown
      label="高级过滤"
      options={options}
      value={selected}
      onChange={setSelected}
      
      // 功能配置
      searchable
      clearable
      showSelectedTags
      
      // 文本配置
      placeholder="选择选项"
      searchPlaceholder="搜索..."
      clearText="清除所有"
      emptyText="未找到匹配项"
      
      // 样式配置
      variant="dashed"
      icon={<Filter className="h-4 w-4" />}
      maxTagsDisplay={3}
      
      // 其他
      className="custom-class"
      align="start"
    />
  )
}
```

##### 与国际化集成

```tsx
import { useTranslation } from 'react-i18next'
import { FilterDropdown } from '@/components/filter'

function I18nFilter() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>([])
  
  // 转换为带翻译的选项
  const options = useMemo(
    () => [
      { value: 'STOCK', label: t('types.stock') },
      { value: 'ETF', label: t('types.etf') },
    ],
    [t]
  )
  
  return (
    <FilterDropdown
      label={t('filters.type')}
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder={t('filters.select_type')}
      clearText={t('filters.clear')}
      emptyText={t('filters.no_results')}
    />
  )
}
```

#### 样式说明

组件使用以下设计特点：

1. **虚线边框**：`variant="dashed"` 时显示虚线边框
2. **圆形添加图标**：默认使用 Plus 图标，可自定义
3. **垂直分隔线**：选中 tag 时自动显示分隔线
4. **Tag 显示**：最多显示指定数量的 tag，超出显示 "+N"

#### 实际应用

参考 `apps/web/src/features/watchlist/components/watchlist-filters.tsx` 查看完整的使用示例。

## 开发指南

### 添加新功能

如需添加新功能，请在 `filter-dropdown.tsx` 中扩展 `FilterDropdownProps` 接口。

### 样式定制

组件使用 Tailwind CSS 和 shadcn/ui 组件库，可通过 `className` 属性进行样式定制。

### 类型安全

所有组件都提供完整的 TypeScript 类型定义，确保类型安全。

## 许可证

MIT
