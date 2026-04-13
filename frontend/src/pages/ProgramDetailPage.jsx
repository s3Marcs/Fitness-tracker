return (
    <div className="relative mb-2">
      <div className="absolute inset-0 bg-[#d93025] flex items-center justify-end pr-4">
        <span className="material-symbols-outlined text-on-error">delete</span>
      </div>
      <div ref={swipeRef} className="relative bg-surface-container-low flex flex-col">
        <div className="flex items-stretch">
          <div className="flex items-center pl-3 pr-1">
            <span
              ref={handleRef}
              data-drag-handle
              className="material-symbols-outlined text-on-surface-variant touch-none cursor-grab select-none"
              style={{ WebkitUserSelect: 'none', userSelect: 'none', fontSize: '1.5rem', padding: '8px', margin: '-8px' }}
            >drag_indicator</span>
          </div>
          <div className="flex-1 flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded((e) => !e)}>
            <div className="flex-1">
              <span className={`${colors.bg} ${colors.text} text-[9px] font-bold px-1.5 py-0.5 uppercase mb-1 inline-block font-headline`}>
                {ex.muscle_group || 'General'}
              </span>
              <p className="text-sm font-black text-white uppercase font-headline tracking-tight">{ex.name}</p>
            </div>
            <div className="text-right mr-2">
              <p className="text-[9px] text-on-surface-variant uppercase font-headline">Default</p>
              <p className="text-sm font-bold text-white font-body">
                {sets}<span className="text-[9px] text-on-surface-variant ml-1">sets</span>
              </p>
              {reps > 0 && (
                <p className="text-sm font-bold text-white font-body">
                  {reps}<span className="text-[9px] text-on-surface-variant ml-1">reps</span>
                </p>
              )}
              {weight > 0 && (
                <p className="text-sm font-bold text-white font-body">
                  {weight}<span className="text-[9px] text-on-surface-variant ml-1">kg</span>
                </p>
              )}
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {expanded && (
          <div className="px-3 pb-3 border-t border-outline-variant/10 pt-3 space-y-3">
            <Stepper label="Default sets" value={sets} onDec={() => setSets((s) => Math.max(1, s - 1))} onInc={() => setSets((s) => s + 1)} />
            <Stepper label="Default reps" value={reps} onDec={() => setReps((r) => Math.max(0, r - 1))} onInc={() => setReps((r) => r + 1)} />
            <Stepper label="Default weight" value={weight}
              onDec={() => setWeight((w) => Math.max(0, parseFloat((w - 2.5).toFixed(1))))}
              onInc={() => setWeight((w) => parseFloat((w + 2.5).toFixed(1)))}
              suffix="KG" />
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="bg-emerald-600 px-4 py-2 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                <span className="text-white text-xs font-black tracking-widest font-headline uppercase">
                  {saving ? '...' : 'Save'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );