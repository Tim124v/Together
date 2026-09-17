import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthLayout from './AuthLayout'
import Wizard from '../components/CoupleSetup/Wizard'
import Step1Action from '../components/CoupleSetup/Step1Action'
import Step2Info from '../components/CoupleSetup/Step2Info'
import Step2bCode from '../components/CoupleSetup/Step2bCode'
import Step3Success from '../components/CoupleSetup/Step3Success'
import Step3bJoined from '../components/CoupleSetup/Step3bJoined'

export default function CoupleSetupPage() {
  const { t } = useTranslation()
  const { createCouple, joinCouple, logout, couple } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = (params.get('code') || '').toUpperCase()
  const stay = useRef(false)

  const [step, setStep] = useState(preset ? 2 : 1)
  const [mode, setMode] = useState(preset ? 'join' : '')
  const [coupleName, setCoupleName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [inviteCode, setInviteCode] = useState(preset)
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (couple && !stay.current && step < 3) navigate('/', { replace: true })
  }, [couple, step, navigate])

  const goDashboard = () => navigate('/', { replace: true })

  const create = async () => {
    setError('')
    setBusy(true)
    stay.current = true
    try {
      const result = await createCouple({
        coupleName: coupleName.trim(),
        startDate: startDate || null,
      })
      setCreated(result)
      setStep(3)
    } catch (err) {
      stay.current = false
      setError(apiError(err, t('setup.createFailed')))
    } finally {
      setBusy(false)
    }
  }

  const join = async () => {
    setError('')
    setBusy(true)
    stay.current = true
    try {
      const result = await joinCouple(inviteCode.trim())
      setCreated(result)
      setStep(3)
    } catch (err) {
      stay.current = false
      setError(apiError(err, t('setup.joinFailed')))
    } finally {
      setBusy(false)
    }
  }

  const titles = {
    1: { title: t('setup.chooseAction'), subtitle: t('setup.chooseActionHint') },
    2:
      mode === 'join'
        ? { title: t('setup.enterCode'), subtitle: t('setup.enterCodeHint') }
        : { title: t('setup.pairInfo'), subtitle: t('setup.pairInfoHint') },
    3:
      mode === 'join'
        ? { title: t('setup.success'), subtitle: t('setup.successHint') }
        : { title: t('setup.done'), subtitle: t('setup.doneHint') },
  }

  return (
    <AuthLayout title="" subtitle={t('setup.layoutSubtitle')} wide>
      <Wizard step={step} {...titles[step]}>
        {step === 1 && (
          <Step1Action
            mode={mode}
            onSelect={setMode}
            onNext={() => mode && setStep(2)}
            onLogout={() => {
              logout()
              navigate('/login')
            }}
          />
        )}
        {step === 2 && mode === 'create' && (
          <Step2Info
            coupleName={coupleName}
            startDate={startDate}
            onName={setCoupleName}
            onDate={setStartDate}
            onBack={() => {
              setError('')
              setStep(1)
            }}
            onNext={create}
            busy={busy}
            error={error}
          />
        )}
        {step === 2 && mode === 'join' && (
          <Step2bCode
            inviteCode={inviteCode}
            onCode={setInviteCode}
            onBack={() => {
              setError('')
              setStep(1)
            }}
            onJoin={join}
            busy={busy}
            error={error}
          />
        )}
        {step === 3 && mode === 'create' && (
          <Step3Success couple={created || couple} onDashboard={goDashboard} />
        )}
        {step === 3 && mode === 'join' && (
          <Step3bJoined couple={created || couple} onDashboard={goDashboard} />
        )}
      </Wizard>
    </AuthLayout>
  )
}
