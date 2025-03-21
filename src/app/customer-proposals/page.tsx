'use client'

import { useState, useRef, useEffect } from 'react'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import {
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  Calendar,
  CheckCircle2,
  X,
  Clock,
  Upload,
} from 'lucide-react'
import PrintProposal from '@/components/invoice/PrintProposal'

interface Proposal {
  id: string;
  proposalNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  validUntil: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'accepted' | 'pending' | 'expired';
  notes?: string;
  acceptedDate?: string;
}

export default function ProposalManagement() {
  const [isCreatingProposal, setIsCreatingProposal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(undefined)
  const printRef = useRef<HTMLDivElement>(null)

  // Example data - replace with actual data from your database
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      proposalNumber: 'PROP-2024-001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '(555) 123-4567',
      customerAddress: '789 Customer Street\nCity, State 12345',
      date: '2024-02-22',
      validUntil: '2024-03-22',
      items: [
        {
          description: '3-Seater Sofa',
          quantity: 1,
          unitPrice: 899.99,
          total: 899.99
        },
        {
          description: 'Coffee Table',
          quantity: 1,
          unitPrice: 299.99,
          total: 299.99
        }
      ],
      subtotal: 1199.98,
      tax: 96.00,
      total: 1295.98,
      status: 'pending',
      notes: 'Delivery available within 2 weeks of acceptance. Installation included.'
    }
  ])

  // Load proposals from localStorage on component mount
  useEffect(() => {
    const savedProposals = localStorage.getItem('proposals')
    if (savedProposals) {
      setProposals(JSON.parse(savedProposals))
    }

    // Load company logo from localStorage if available
    const savedLogo = localStorage.getItem('companyLogo')
    if (savedLogo) {
      setCompanyLogo(savedLogo)
    }
  }, [])

  // Save proposals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('proposals', JSON.stringify(proposals))
  }, [proposals])

  // Calculate proposal metrics
  const totalProposals = proposals.length
  const pendingProposals = proposals.filter(p => p.status === 'pending').length
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length
  const expiredProposals = proposals.filter(p => p.status === 'expired').length

  const handleAddProposal = (newProposal: Omit<Proposal, 'id' | 'status' | 'proposalNumber'>) => {
    const proposal: Proposal = {
      ...newProposal,
      id: `${Date.now()}`,
      proposalNumber: `PROP-${new Date().getFullYear()}-${(proposals.length + 1).toString().padStart(3, '0')}`,
      status: 'pending'
    }
    setProposals([...proposals, proposal])
  }

  const handlePrint = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsPrintModalOpen(true)
    // Give time for the modal to render before printing
    setTimeout(() => {
      if (printRef.current) {
        const content = printRef.current
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Proposal</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              </head>
              <body>
                ${content.innerHTML}
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.focus()
          printWindow.print()
          printWindow.close()
        }
      }
    }, 100)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string
        setCompanyLogo(logoDataUrl)
        localStorage.setItem('companyLogo', logoDataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStatusChange = (proposalId: string, newStatus: 'accepted' | 'pending' | 'expired') => {
    setProposals(proposals.map(proposal => {
      if (proposal.id === proposalId) {
        return {
          ...proposal,
          status: newStatus,
          acceptedDate: newStatus === 'accepted' ? new Date().toISOString().split('T')[0] : proposal.acceptedDate
        }
      }
      return proposal
    }))
  }

  const filteredProposals = proposals.filter(proposal => {
    // Apply search filter
    const matchesSearch =
      proposal.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.customerName.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply date filter
    let matchesDate = true
    if (dateFilter === 'thisMonth') {
      const thisMonth = new Date().getMonth()
      const thisYear = new Date().getFullYear()
      const proposalDate = new Date(proposal.date)
      matchesDate = proposalDate.getMonth() === thisMonth && proposalDate.getFullYear() === thisYear
    }

    return matchesSearch && matchesDate
  })

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Customers</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Customer Proposals</span>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Logo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
            <button
              className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg"
              onClick={() => setIsCreatingProposal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New Proposal</span>
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Total Proposals</p>
                <p className="text-2xl font-semibold mt-1">{totalProposals}</p>
              </div>
              <div className="p-3 bg-[#2D6BFF]/10 rounded-lg">
                <FileText className="h-6 w-6 text-[#2D6BFF]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-semibold mt-1">{pendingProposals}</p>
              </div>
              <div className="p-3 bg-[#FF9500]/10 rounded-lg">
                <Clock className="h-6 w-6 text-[#FF9500]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Accepted</p>
                <p className="text-2xl font-semibold mt-1">{acceptedProposals}</p>
              </div>
              <div className="p-3 bg-[#00C48C]/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#00C48C]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Expired</p>
                <p className="text-2xl font-semibold mt-1">{expiredProposals}</p>
              </div>
              <div className="p-3 bg-[#FF3B30]/10 rounded-lg">
                <X className="h-6 w-6 text-[#FF3B30]" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search proposals..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button
              className={`flex items-center px-4 py-2 text-sm rounded-lg ${dateFilter === 'all'
                ? 'text-white bg-[#2D6BFF]'
                : 'text-[#1A1A1A] hover:bg-gray-100'
                }`}
              onClick={() => setDateFilter('all')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>All Dates</span>
            </button>
            <button
              className={`flex items-center px-4 py-2 text-sm rounded-lg ${dateFilter === 'thisMonth'
                ? 'text-white bg-[#2D6BFF]'
                : 'text-[#1A1A1A] hover:bg-gray-100'
                }`}
              onClick={() => setDateFilter('thisMonth')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>This Month</span>
            </button>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Proposal #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Valid Until
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#2D6BFF]">{proposal.proposalNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{proposal.customerName}</div>
                      <div className="text-sm text-gray-500">{proposal.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proposal.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proposal.validUntil}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${proposal.total.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${proposal.status === 'pending'
                        ? 'bg-[#FF9500]/10 text-[#FF9500]'
                        : proposal.status === 'accepted'
                          ? 'bg-[#00C48C]/10 text-[#00C48C]'
                          : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                        }`}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        className="text-gray-500 hover:text-[#2D6BFF]"
                        onClick={() => handlePrint(proposal)}
                      >
                        <Printer className="h-5 w-5 inline" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-[#00C48C]"
                        onClick={() => handleStatusChange(proposal.id, 'accepted')}
                        disabled={proposal.status === 'accepted'}
                      >
                        <CheckCircle2 className={`h-5 w-5 inline ${proposal.status === 'accepted' ? 'text-[#00C48C]' : ''}`} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-[#FF3B30]"
                        onClick={() => handleStatusChange(proposal.id, 'expired')}
                        disabled={proposal.status === 'expired'}
                      >
                        <X className={`h-5 w-5 inline ${proposal.status === 'expired' ? 'text-[#FF3B30]' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProposals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No proposals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {isPrintModalOpen && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium">Print Proposal</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsPrintModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <PrintProposal ref={printRef} proposal={selectedProposal} companyLogo={companyLogo} />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg"
                onClick={() => handlePrint(selectedProposal)}
              >
                <Printer className="mr-2 h-4 w-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Add CreateProposalModal component */}
      {/* {isCreatingProposal && (
        <CreateProposalModal
          onClose={() => setIsCreatingProposal(false)}
          onCreateProposal={handleAddProposal}
        />
      )} */}
    </DeliveryLayout>
  )
} 