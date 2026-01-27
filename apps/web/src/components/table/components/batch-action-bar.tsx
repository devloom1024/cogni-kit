import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { BatchAction } from '../types'

export interface BatchActionBarProps<TData> {
    selectedCount: number
    actions: BatchAction<TData>[]
    selectedRows: TData[]
    onClearSelection: () => void
    animated?: boolean
    selectedLabel?: string
    clearLabel?: string
}

/**
 * 批量操作栏组件
 * 当有行被选中时显示，提供批量操作按钮
 */
export function BatchActionBar<TData>({
    selectedCount,
    actions,
    selectedRows,
    onClearSelection,
    animated = true,
    selectedLabel = '已选择 {count} 项',
    clearLabel = '取消选择',
}: BatchActionBarProps<TData>) {
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        action?: BatchAction<TData>
    }>({ open: false })

    const handleActionClick = (action: BatchAction<TData>) => {
        if (action.confirmDialog) {
            setConfirmDialog({ open: true, action })
        } else {
            action.onClick(selectedRows)
        }
    }

    const handleConfirm = async () => {
        if (confirmDialog.action) {
            await confirmDialog.action.onClick(selectedRows)
            setConfirmDialog({ open: false })
        }
    }

    const content = (
        <div className="flex items-center justify-between gap-4 bg-muted/50 px-4 py-2.5 rounded-md border border-border">
            {/* 左侧：选中信息 */}
            <motion.div
                className="flex items-center gap-2 text-sm font-medium"
                initial={animated ? { scale: 0.95 } : undefined}
                animate={animated ? { scale: 1 } : undefined}
                transition={animated ? { delay: 0.1 } : undefined}
            >
                <CheckSquare className="h-4 w-4 text-primary" />
                <span>{selectedLabel.replace('{count}', String(selectedCount))}</span>
            </motion.div>

            {/* 右侧：操作按钮 */}
            <motion.div
                className="flex items-center gap-2"
                initial={animated ? { scale: 0.95 } : undefined}
                animate={animated ? { scale: 1 } : undefined}
                transition={animated ? { delay: 0.15 } : undefined}
            >
                {/* 取消选择 */}
                <motion.div
                    whileHover={animated ? { scale: 1.05 } : undefined}
                    whileTap={animated ? { scale: 0.95 } : undefined}
                >
                    <Button variant="ghost" size="sm" onClick={onClearSelection}>
                        <X className="mr-2 h-4 w-4" />
                        {clearLabel}
                    </Button>
                </motion.div>

                {/* 批量操作按钮 */}
                {actions.map((action) => (
                    <motion.div
                        key={action.key}
                        whileHover={animated ? { scale: 1.05 } : undefined}
                        whileTap={animated ? { scale: 0.95 } : undefined}
                    >
                        <Button
                            variant={action.variant || 'default'}
                            size="sm"
                            onClick={() => handleActionClick(action)}
                        >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                        </Button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )

    return (
        <>
            {content}

            {/* 确认对话框 */}
            {confirmDialog.action?.confirmDialog && (
                <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open })}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmDialog.action.confirmDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmDialog.action.confirmDialog.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                {confirmDialog.action.confirmDialog.cancelText || '取消'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirm}
                                className={
                                    confirmDialog.action.variant === 'destructive'
                                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                        : undefined
                                }
                            >
                                {confirmDialog.action.confirmDialog.confirmText || '确认'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    )
}
