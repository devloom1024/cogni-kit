import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { EnhancedTableConfig } from '../types'
import { useTableState } from '../hooks/use-table-state'
import { useRowSelection } from '../hooks/use-row-selection'
import { TableLoading } from './table-loading'
import { TableContent } from './table-content'
import { TablePagination } from './table-pagination'
import { TableToolbar } from './table-toolbar'
import { ColumnVisibilityMenu } from './column-visibility-menu'
import { BatchActionBar } from './batch-action-bar'

/**
 * 增强表格主组件
 * 
 * 这是一个功能丰富的表格组件，支持：
 * - 服务端/客户端分页
 * - 服务端/客户端排序
 * - 行选择（单选/多选）
 * - 批量操作
 * - 列可见性控制
 * - 加载状态
 * - 空状态
 * - 动画效果
 * 
 * @example
 * ```tsx
 * <EnhancedTable
 *   columns={columns}
 *   data={data}
 *   loading={loading}
 *   pagination={{
 *     meta: paginationMeta,
 *     onPageChange: handlePageChange,
 *   }}
 *   selection={{
 *     enabled: true,
 *     mode: 'multiple',
 *   }}
 *   batchActions={[
 *     {
 *       key: 'delete',
 *       label: '删除',
 *       variant: 'destructive',
 *       onClick: handleBatchDelete,
 *     },
 *   ]}
 * />
 * ```
 */
export function EnhancedTable<TData>(config: EnhancedTableConfig<TData>) {
    // 初始化表格状态
    const { table } = useTableState(config)

    // 行选择管理
    const selection = useRowSelection(table, config.selection)

    // 是否启用动画
    const animated = config.animations?.enabled !== false
    const batchActionBarAnimated = config.animations?.batchActionBar !== false && animated

    return (
        <div className={cn('flex flex-col space-y-4', config.className)}>
            {/* 工具栏区域 */}
            <div className="relative min-h-12">
                <AnimatePresence mode="wait">
                    {/* 默认工具栏 */}
                    {!selection.hasSelection && (
                        <motion.div
                            key="toolbar"
                            initial={animated ? { opacity: 0, y: -10 } : undefined}
                            animate={animated ? { opacity: 1, y: 0 } : undefined}
                            exit={animated ? { opacity: 0, y: -10 } : undefined}
                            transition={animated ? { duration: 0.2, ease: 'easeInOut' } : undefined}
                            className="absolute inset-0 flex items-center gap-4"
                        >
                            <TableToolbar className="mb-0 flex-1">
                                {/* 这里可以放置过滤器等自定义内容 */}
                                {config.filters && (
                                    <div className="flex-1">
                                        {/* 过滤器组件需要由使用者提供 */}
                                    </div>
                                )}
                            </TableToolbar>

                            {/* 列可见性菜单 */}
                            {config.columnVisibility?.enabled && (
                                <ColumnVisibilityMenu
                                    table={table}
                                    getColumnLabel={config.columnVisibility.getColumnLabel}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* 批量操作栏 */}
                    {selection.hasSelection && config.batchActions && config.batchActions.length > 0 && (
                        <motion.div
                            key="batch-actions"
                            initial={animated ? { opacity: 0, y: 10 } : undefined}
                            animate={animated ? { opacity: 1, y: 0 } : undefined}
                            exit={animated ? { opacity: 0, y: 10 } : undefined}
                            transition={animated ? { duration: 0.2, ease: 'easeInOut' } : undefined}
                            className="absolute inset-0"
                        >
                            <BatchActionBar
                                selectedCount={selection.selectedCount}
                                actions={config.batchActions}
                                selectedRows={selection.selectedRows}
                                onClearSelection={selection.clearSelection}
                                animated={batchActionBarAnimated}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 表格内容 */}
            <TableLoading loading={config.loading}>
                <TableContent
                    table={table}
                    emptyState={config.emptyState}
                    className={config.tableClassName}
                />
            </TableLoading>

            {/* 分页 */}
            {config.pagination?.meta && config.pagination.meta.total > 0 && (
                <TablePagination
                    meta={config.pagination.meta}
                    onPageChange={config.pagination.onPageChange || (() => { })}
                    showTotal={config.pagination.showTotal}
                    totalLabel={config.pagination.totalLabel}
                    previousLabel={config.pagination.previousLabel}
                    nextLabel={config.pagination.nextLabel}
                />
            )}
        </div>
    )
}
