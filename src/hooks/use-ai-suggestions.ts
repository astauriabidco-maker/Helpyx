'use client'

import { useState, useCallback } from 'react'

interface TicketAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedResolutionTime: number;
  suggestedSolutions: Solution[];
  relatedEquipment: string[];
  confidence: number;
}

interface Solution {
  title: string;
  description: string;
  steps: string[];
  probability: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  relatedArticles: string[];
}

interface UseAISuggestionsReturn {
  analyzeTicket: (description: string, equipmentInfo?: any) => Promise<TicketAnalysis | null>;
  isLoading: boolean;
  error: string | null;
  analysis: TicketAnalysis | null;
}

export function useAISuggestions(): UseAISuggestionsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<TicketAnalysis | null>(null)

  const analyzeTicket = useCallback(async (
    description: string, 
    equipmentInfo?: any
  ): Promise<TicketAnalysis | null> => {
    setIsLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketDescription: description,
          equipmentInfo
        })
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      setAnalysis(result)
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('AI Analysis error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    analyzeTicket,
    isLoading,
    error,
    analysis
  }
}