import { useState, useMemo } from 'react'
import { PlusCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface FilterOption {
    value: string
    label: string
    icon?: React.ReactNode
}

export interface FilterDropdownProps {
    // 基础配置
    label: string
    options: FilterOption[]
    value: string[]
    onChange: (value: string[]) => void

    // 功能开关
    searchable?: boolean
    clearable?: boolean
    showSelectedTags?: boolean

    // 自定义文本
    placeholder?: string
    emptyText?: string
    clearText?: string
    searchPlaceholder?: string

    // 样式配置
    variant?: 'default' | 'dashed'
    icon?: React.ReactNode
    maxTagsDisplay?: number

    // 其他
    className?: string
    align?: 'start' | 'center' | 'end'
    size?: "default" | "sm" | "lg" | "icon"
}

export function FilterDropdown({
    label,
    options,
    value,
    onChange,
    searchable = true,
    clearable = true,
    showSelectedTags = true,
    placeholder,
    emptyText = 'No results found',
    clearText = 'Clear filters',
    searchPlaceholder = 'Search...',
    variant = 'dashed',
    icon,
    maxTagsDisplay = 2,
    className,
    align = 'start',
    size,
}: FilterDropdownProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    // 过滤选项
    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options
        const query = searchQuery.toLowerCase()
        return options.filter((option) =>
            option.label.toLowerCase().includes(query)
        )
    }, [options, searchQuery])

    // 获取选中的标签
    const selectedTags = useMemo(() => {
        return options.filter((option) => value.includes(option.value))
    }, [options, value])

    // 处理选项切换
    const handleToggle = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue]
        onChange(newValue)
    }

    // 清除所有选中
    const handleClear = () => {
        onChange([])
        setSearchQuery('')
    }

    // 重置搜索
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setSearchQuery('')
        }
    }

    // 显示的标签（限制数量）
    const displayTags = selectedTags.slice(0, maxTagsDisplay)
    const remainingCount = selectedTags.length - maxTagsDisplay

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size={size}
                    className={cn(
                        'gap-2',
                        variant === 'dashed' && 'border-dashed',
                        className
                    )}
                >
                    {/* 左侧图标 */}
                    {icon || <PlusCircle className="h-4 w-4" />}

                    {/* 按钮文字 */}
                    <span>{label}</span>

                    {/* 垂直分隔线和选中的 tags */}
                    {showSelectedTags && selectedTags.length > 0 && (
                        <>
                            <div className="h-4 w-px bg-border" />
                            <div className="flex items-center gap-1">
                                {displayTags.map((tag) => (
                                    <Badge
                                        key={tag.value}
                                        variant="secondary"
                                        className="rounded-sm px-1.5 py-0 text-xs font-normal"
                                    >
                                        {tag.label}
                                    </Badge>
                                ))}
                                {remainingCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1.5 py-0 text-xs font-normal"
                                    >
                                        +{remainingCount}
                                    </Badge>
                                )}
                            </div>
                        </>
                    )}

                    {/* 如果不显示 tags，只显示数量 */}
                    {!showSelectedTags && value.length > 0 && (
                        <Badge
                            variant="secondary"
                            className="ml-1 rounded-sm px-1.5 py-0 text-xs font-normal"
                        >
                            {value.length}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={align} className="w-56">
                {/* 标题 */}
                {placeholder && <DropdownMenuLabel>{placeholder}</DropdownMenuLabel>}

                {/* 搜索框 */}
                {searchable && (
                    <>
                        <div className="px-2 py-1.5">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 pl-8 border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* 选项列表 */}
                <div className="max-h-64 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onSelect={(e) => {
                                    e.preventDefault()
                                    handleToggle(option.value)
                                }}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Checkbox
                                        checked={value.includes(option.value)}
                                        className="pointer-events-none data-[state=checked]:text-primary-foreground [&>span]:data-[state=checked]:text-primary-foreground [&_svg]:!text-primary-foreground"
                                    />
                                    {option.icon && (
                                        <span className="text-muted-foreground">
                                            {option.icon}
                                        </span>
                                    )}
                                    <span>{option.label}</span>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            {emptyText}
                        </div>
                    )}
                </div>

                {/* 清除按钮 */}
                {clearable && value.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center text-sm h-8"
                                onClick={handleClear}
                            >
                                {clearText}
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
