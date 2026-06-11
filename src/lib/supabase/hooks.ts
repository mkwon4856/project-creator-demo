'use client'
import { useEffect, useState } from 'react'
import { createClient } from './client'
import type { Profile, Studio, Creator, CreatorChannel, Campaign, Mission, Application } from '../db.types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
  }, [])
  return { profile, loading }
}

export function useStudio() {
  const [studio, setStudio] = useState<Studio | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('studios').select('*').eq('profile_id', user.id).maybeSingle()
        .then(({ data }) => { setStudio(data); setLoading(false) })
    })
  }, [])
  return { studio, loading }
}

export function useCreator() {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('creators').select('*').eq('profile_id', user.id).single()
        .then(({ data }) => { setCreator(data); setLoading(false) })
    })
  }, [])
  return { creator, loading }
}

export function useCreatorChannels(creatorId: string | null) {
  const [channels, setChannels] = useState<CreatorChannel[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!creatorId) { setLoading(false); return }
    supabase.from('creator_channels').select('*').eq('creator_id', creatorId)
      .then(({ data }) => { setChannels(data ?? []); setLoading(false) })
  }, [creatorId])
  return { channels, loading }
}

export function useStudioCampaigns(studioId: string | null) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!studioId) { setLoading(false); return }
    supabase.from('campaigns').select('*').eq('studio_id', studioId).order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data ?? []); setLoading(false) })
  }, [studioId])
  return { campaigns, loading }
}

export function useActiveCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.from('campaigns').select('*, missions(*)').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data ?? []); setLoading(false) })
  }, [])
  return { campaigns, loading }
}

export function useMissions(campaignId: string | null) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!campaignId) { setLoading(false); return }
    supabase.from('missions').select('*').eq('campaign_id', campaignId)
      .then(({ data }) => { setMissions(data ?? []); setLoading(false) })
  }, [campaignId])
  return { missions, loading }
}

export function useApplications(creatorId: string | null) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!creatorId) { setLoading(false); return }
    supabase.from('applications').select('*, campaigns(*)').eq('creator_id', creatorId).order('applied_at', { ascending: false })
      .then(({ data }) => { setApplications(data ?? []); setLoading(false) })
  }, [creatorId])
  return { applications, loading }
}

// ─── Backward-compatible aliases ────────────────────────────────
// 기존 호출부(useCurrent*, { data, loading } 형태)를 깨지 않기 위한 어댑터.
// 신규 코드는 위의 useProfile/useStudio/useCreator를 직접 사용할 것.
export function useCurrentProfile() {
  const { profile, loading } = useProfile()
  return { data: profile, loading }
}

export function useCurrentStudio() {
  const { studio, loading } = useStudio()
  return { data: studio, loading }
}

export function useCurrentCreator() {
  const { creator, loading } = useCreator()
  return { data: creator, loading }
}
