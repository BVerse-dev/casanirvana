import type { Metadata } from 'next'
import { Alert, Col, Row } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import AgencyAdd from '../../agency/add/components/AgencyAdd'
import AgencyAddCard from '../../agency/add/components/AgencyAddCard'

export const metadata: Metadata = { title: 'Add Agency | Casa Nirvana Admin' }
const FORM_ID = 'agency-directory-form'
export default function AddAgencyPage() { return <><PageTitle subName="People" title="Add New Agency" /><Row><AgencyAddCard formId={FORM_ID} /><Col xl={9} lg={8}><Alert variant="info">Agency logos remain unavailable until a scoped storage contract is approved.</Alert><AgencyAdd formId={FORM_ID} /></Col></Row></> }
