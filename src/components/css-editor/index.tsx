'use client'

import React, { useState } from 'react'

interface Props {
  value: string
  setValue: (val: string) => void
}

const CssEditor = ({ value, setValue }: Props) => {
  const lines = (value || '').split('\n').length

  return (
    <div className="rounded-xl border border-border bg-[#1e1e1e] text-slate-100 font-mono text-xs overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-border/40 text-slate-400 text-xs">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          <span className="ml-2 font-medium text-slate-300">custom-global.css</span>
        </span>
        <span>CSS Syntax</span>
      </div>
      <div className="relative flex min-h-[380px] max-h-[500px]">
        <div className="select-none py-3 px-3 text-right text-slate-500 bg-[#1a1a1a] border-r border-border/20 text-xs font-mono leading-[20px] w-12 shrink-0">
          {Array.from({ length: Math.max(lines, 18) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`/* Write custom CSS styles here */\n:root {\n  --primary: #D8FC38;\n}\n\n.custom-element {\n  border-radius: 8px;\n}`}
          className="w-full h-full min-h-[380px] p-3 bg-transparent text-slate-100 resize-none font-mono text-xs leading-[20px] focus:outline-none focus:ring-0 border-0"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export default CssEditor
