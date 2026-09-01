import re

with open('src/app/components/CentralAnalyticsHub.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Improve the overview View Mode toggles
old_view_toggles = """            <div className="flex items-center gap-2">
              <button onClick={() => setOverviewViewMode('charts')} className={`p-1.5 rounded ${overviewViewMode === 'charts' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}><BarChart3 className="w-4 h-4" /></button>
              <button onClick={() => setOverviewViewMode('cards')} className={`p-1.5 rounded ${overviewViewMode === 'cards' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setOverviewViewMode('table')} className={`p-1.5 rounded ${overviewViewMode === 'table' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}><Table className="w-4 h-4" /></button>
            </div>"""

new_view_toggles = """            <div className="bg-gray-100 p-1 rounded-lg flex items-center">
              <button onClick={() => setOverviewViewMode('charts')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${overviewViewMode === 'charts' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-gray-900'}`}><BarChart3 className="w-4 h-4" /> Charts</button>
              <button onClick={() => setOverviewViewMode('cards')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${overviewViewMode === 'cards' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-gray-900'}`}><LayoutGrid className="w-4 h-4" /> Cards</button>
              <button onClick={() => setOverviewViewMode('table')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${overviewViewMode === 'table' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-gray-900'}`}><Table className="w-4 h-4" /> Roster</button>
            </div>"""

content = content.replace(old_view_toggles, new_view_toggles)

# 2. Improve the Heatmap Dimension group buttons
old_heatmap_buttons = """            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-600">Dimension Group:</p>
              {Object.keys(DIMENSION_GROUPS).map(g => (
                <button key={g} onClick={() => setHeatmapGroup(g)} className={`px-3 py-1.5 rounded-full text-xs transition-all ${heatmapGroup === g ? 'bg-[#5B7DB1] text-white' : 'bg-white text-gray-600 border'}`}>
                  {g}
                </button>
              ))}
            </div>"""

new_heatmap_buttons = """            <div className="bg-slate-100 p-1.5 rounded-xl inline-flex items-center gap-1 flex-wrap">
              {Object.keys(DIMENSION_GROUPS).map(g => (
                <button key={g} onClick={() => setHeatmapGroup(g)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${heatmapGroup === g ? 'bg-[#5B7DB1] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-200'}`}>
                  {g}
                </button>
              ))}
            </div>"""

content = content.replace(old_heatmap_buttons, new_heatmap_buttons)

# 3. Simplify the Heatmap scores to Low/Med/High visual badges instead of raw numbers
# Find the heatmap td renderer
heatmap_cell_old = """                            <td key={dim} className="px-2 py-2 text-center">
                              {score != null ? (
                                <div className="px-2 py-1 rounded font-mono text-[10px]" style={{ backgroundColor: scoreColor(score, max), color: scoreTextColor(score, max) }}>{score}</div>
                              ) : <div className="px-2 py-1 rounded text-[10px] bg-gray-50 text-gray-300">—</div>}
                            </td>"""

heatmap_cell_new = """                            <td key={dim} className="px-2 py-2 text-center" title={`Score: ${score}/${max}`}>
                              {score != null ? (
                                <div className="flex flex-col items-center">
                                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                                    <div className="h-full" style={{ width: `${(score/max)*100}%`, backgroundColor: scoreColor(score, max) }}></div>
                                  </div>
                                  <span className="text-[10px] font-bold" style={{ color: scoreColor(score, max) }}>
                                    {score > max * 0.75 ? 'HIGH' : score > max * 0.4 ? 'MED' : 'LOW'}
                                  </span>
                                </div>
                              ) : <div className="text-[10px] text-gray-300">—</div>}
                            </td>"""

content = content.replace(heatmap_cell_old, heatmap_cell_new)

with open('src/app/components/CentralAnalyticsHub.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CentralAnalyticsHub UI")
