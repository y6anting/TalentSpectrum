"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}

interface ConfirmDialogContextType {
  showConfirm: (options: ConfirmDialogOptions) => void
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogOptions, setDialogOptions] = useState<ConfirmDialogOptions | null>(null)

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setDialogOptions(options)
  }, [])

  const handleConfirm = () => {
    if (dialogOptions?.onConfirm) {
      dialogOptions.onConfirm()
    }
    setDialogOptions(null)
  }

  const handleCancel = () => {
    if (dialogOptions?.onCancel) {
      dialogOptions.onCancel()
    }
    setDialogOptions(null)
  }

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      <AnimatePresence>
        {dialogOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancel}
            />
            
            {/* Dialog */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {dialogOptions.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {dialogOptions.message}
                    </p>
                    <div className="flex gap-3 justify-end">
                      
                      <Button
                        onClick={handleConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white hover:cursor-pointer"
                      >
                        {dialogOptions.confirmText || "Confirm"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-gray-300 hover:bg-gray-100 hover:cursor-pointer"
                      >
                        {dialogOptions.cancelText || "Cancel"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}
