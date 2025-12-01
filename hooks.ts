
import { useState, useCallback, useEffect } from 'react';
import { FigureData, FigureType, FigureParams } from './types';
import { calculateFigure, getDefaultParams } from './utils';

export const useFigureManager = () => {
    const [figures, setFigures] = useState<FigureData[]>([]);
    
    // History Stacks
    const [history, setHistory] = useState<FigureData[][]>([]);
    const [future, setFuture] = useState<FigureData[][]>([]);

    const saveToHistory = useCallback(() => {
        setHistory(prev => [...prev, figures]);
        setFuture([]); 
    }, [figures]);

    const addFigure = useCallback((type: FigureType) => {
        saveToHistory();
        const params = getDefaultParams(type);
        const { volume, formula } = calculateFigure(type, params);
        
        const newFigure: FigureData = {
            id: Date.now(),
            type,
            params,
            volume,
            formula
        };
        setFigures(prev => [...prev, newFigure]);
    }, [figures, saveToHistory]);

    const updateFigure = useCallback((id: number, field: string, value: number) => {
        setFigures(prev => prev.map(fig => {
            if (fig.id !== id) return fig;
            
            const newParams = { ...fig.params, [field]: value };
            const { volume, formula } = calculateFigure(fig.type, newParams);
            
            return { ...fig, params: newParams, volume, formula };
        }));
    }, []);
    
    // Special wrapper for Update that saves history ONLY on start of interaction could be added here
    // For now, we rely on the user manually not needing history for every single keystroke if we used onBlur, 
    // but since we update live, we might want to debounce history saving. 
    // To keep it simple and consistent with previous behavior:
    // NOTE: In a real production app, we wouldn't save history on every single character change.
    
    const removeFigure = useCallback((id: number) => {
        saveToHistory();
        setFigures(prev => prev.filter(f => f.id !== id));
    }, [saveToHistory]);

    const clearFigures = useCallback(() => {
        if (figures.length === 0) return;
        saveToHistory();
        setFigures([]);
    }, [figures, saveToHistory]);

    const undo = useCallback(() => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setFuture(prev => [figures, ...prev]);
        setFigures(previous);
        setHistory(prev => prev.slice(0, -1));
    }, [history, figures]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        setHistory(prev => [...prev, figures]);
        setFigures(next);
        setFuture(prev => prev.slice(1));
    }, [future, figures]);

    const loadFigures = useCallback((newFigures: FigureData[]) => {
        saveToHistory();
        setFigures(newFigures);
    }, [saveToHistory]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return {
        figures,
        addFigure,
        updateFigure,
        removeFigure,
        clearFigures,
        undo,
        redo,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        loadFigures
    };
};
