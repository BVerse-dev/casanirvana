"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/wrappers/SimplebarReactClient";
import { useEmailContext } from "@/context/useEmailContext";
import { getAllUsers, getEmailsCategoryCount, getLabelCounts } from "@/helpers/data";
import { userData } from "@/assets/data/other";
import { useFetchData } from "@/hooks/useFetchData";
import useToggle from "@/hooks/useToggle";
import useViewPort from "@/hooks/useViewPort";
import { EmailCountType } from "@/types/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCreateEmail, useEmailCategoryCounts } from "@/hooks/useEmails";
import { toast } from "react-toastify";
import {
  Button,
  CardBody,
  Collapse,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Offcanvas,
} from "react-bootstrap";

const NavBar = () => {
  const inboxUser = useFetchData(getAllUsers);
  const { activeLabel, changeActiveLabel } = useEmailContext();
  const labelCounts = getLabelCounts();

  const [emailsCount, setEmailsCount] = useState<EmailCountType>({
    inbox: 0,
    starred: 0,
    draft: 0,
    sent: 0,
    deleted: 0,
    important: 0,
    promotions: 0,
    updates: 0,
    snoozed: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getEmailsCategoryCount();
      if (data) setEmailsCount(data);
    };
    fetchData();
  }, []);

  const { isTrue, toggle: toggleCollapse } = useToggle();
  const { isTrue: compaseTrue, toggle: toggleCompase } = useToggle();
  const { isTrue: isOpenContact, toggle: toggleContact } = useToggle();
  const { isTrue: isMoreOpen, toggle: toggleMore } = useToggle();
  const { isTrue: showCreateLabel, toggle: toggleCreateLabel } = useToggle();

  const [emailForm, setEmailForm] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    message: ''
  });

  const [newLabel, setNewLabel] = useState({
    name: '',
    color: 'primary'
  });

  const [customLabels, setCustomLabels] = useState<Array<{name: string, color: string}>>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState({
    date: '',
    time: ''
  });
  const [restoreHandler, setRestoreHandler] = useState<(() => void) | null>(null);

  const createEmailMutation = useCreateEmail();
  const [isSending, setIsSending] = useState(false);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      if (restoreHandler) {
        const modalHeader = document.querySelector('.compose-mail .modal-header') as HTMLElement;
        if (modalHeader) {
          modalHeader.removeEventListener('click', restoreHandler);
        }
      }
    };
  }, [restoreHandler]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = async () => {
    // Professional validation
    if (!emailForm.to.trim()) {
      toast.error('Please enter recipient email address');
      return;
    }
    
    if (!validateEmail(emailForm.to)) {
      toast.error('Please enter a valid recipient email address');
      return;
    }
    
    if (!emailForm.subject.trim()) {
      toast.error('Please enter email subject');
      return;
    }
    
    if (!emailForm.message.trim()) {
      toast.error('Please enter email message');
      return;
    }

    // Validate CC and BCC if provided
    if (emailForm.cc && !validateEmail(emailForm.cc)) {
      toast.error('Please enter a valid CC email address');
      return;
    }
    
    if (emailForm.bcc && !validateEmail(emailForm.bcc)) {
      toast.error('Please enter a valid BCC email address');
      return;
    }

    setIsSending(true);
    
    try {
      // Create professional email data structure
      const emailData = {
        subject: emailForm.subject.trim(),
        body: emailForm.message.trim(),
        is_html: false,
        sent_at: new Date().toISOString(),
        folder: 'sent',
        priority: 'normal',
        has_attachment: false,
        is_starred: false,
        is_important: false,
        is_draft: false,
        is_deleted: false,
        is_read: true,
        email_type: 'outgoing',
        status: 'sent'
      };

      // Send email using professional hook
      await createEmailMutation.mutateAsync(emailData);
      
      // Reset form and close modal
      setEmailForm({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        message: ''
      });
      toggleCompase();
      
      // Refresh counts
      const data = await getEmailsCategoryCount();
      if (data) setEmailsCount(data);
      
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateLabel = () => {
    if (!newLabel.name.trim()) {
      toast.error('Please enter a label name');
      return;
    }

    // Check if label already exists
    if (customLabels.some(label => label.name.toLowerCase() === newLabel.name.toLowerCase()) ||
        ['Collaboration', 'New Client', 'Wedding'].includes(newLabel.name)) {
      toast.error('Label already exists');
      return;
    }

    // Add new label
    setCustomLabels(prev => [...prev, { name: newLabel.name, color: newLabel.color }]);
    setNewLabel({ name: '', color: 'primary' });
    toggleCreateLabel();
    toast.success(`Label "${newLabel.name}" created successfully`);
  };

  // Handle file attachment
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
      const attachArea = document.getElementById('attachments-area');
      if (attachArea) {
        attachArea.style.display = 'block';
        const fileList = attachArea.querySelector('.file-list') || document.createElement('div');
        fileList.className = 'file-list mt-2';
        fileList.innerHTML = '';
        
        [...attachedFiles, ...newFiles].forEach((file, idx) => {
          const fileItem = document.createElement('div');
          fileItem.className = 'd-flex align-items-center justify-content-between p-2 border rounded mb-1';
          fileItem.innerHTML = `
            <div class="d-flex align-items-center">
              <i class="ri-file-text-line me-2"></i>
              <span class="small">${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()">
              <i class="ri-close-line"></i>
            </button>
          `;
          fileList.appendChild(fileItem);
        });
        
        if (!attachArea.contains(fileList)) {
          attachArea.appendChild(fileList);
        }
      }
      toast.success(`${newFiles.length} file(s) attached`);
    }
  };

  // Handle photo attachment
  const handlePhotoAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const newFiles = Array.from(files);
        setAttachedFiles(prev => [...prev, ...newFiles]);
        const attachArea = document.getElementById('attachments-area');
        if (attachArea) {
          attachArea.style.display = 'block';
          newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = document.createElement('img');
              img.src = e.target?.result as string;
              img.className = 'img-thumbnail me-2 mb-2';
              img.style.maxWidth = '100px';
              img.style.maxHeight = '100px';
              attachArea.appendChild(img);
            };
            reader.readAsDataURL(file);
          });
        }
        toast.success(`${newFiles.length} photo(s) attached`);
      }
    };
    input.click();
  };

  // Handle link insertion
  const handleInsertLink = () => {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text (optional):') || url;
    if (url) {
      const linkHtml = `<a href="${url}" target="_blank">${text}</a>`;
      const textarea = document.querySelector('#compose-message') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = emailForm.message;
        const newValue = currentValue.substring(0, start) + linkHtml + currentValue.substring(end);
        setEmailForm(prev => ({ ...prev, message: newValue }));
        toast.success('Link inserted');
      }
    }
  };

  // Handle emoji insertion
  const handleInsertEmoji = () => {
    const emojis = ['😀', '😊', '😍', '🤔', '👍', '❤️', '😂', '🔥', '💯', '🎉'];
    const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const textarea = document.querySelector('#compose-message') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = emailForm.message;
      const newValue = currentValue.substring(0, start) + selectedEmoji + currentValue.substring(end);
      setEmailForm(prev => ({ ...prev, message: newValue }));
      toast.success('Emoji added');
    }
  };

  // Handle minimize/maximize
  const handleMinimize = () => {
    const modal = document.querySelector('.compose-mail .modal-dialog') as HTMLElement;
    const modalContent = document.querySelector('.compose-mail .modal-content') as HTMLElement;
    const modalHeader = document.querySelector('.compose-mail .modal-header') as HTMLElement;
    
    if (modal && modalContent && modalHeader) {
      if (!isMinimized) {
        // Minimize: move to bottom-right corner
        modal.style.transition = 'all 0.3s ease-in-out';
        modal.style.position = 'fixed';
        modal.style.bottom = '20px';
        modal.style.right = '20px';
        modal.style.top = 'auto';
        modal.style.left = 'auto';
        modal.style.margin = '0';
        modal.style.maxWidth = '350px';
        modal.style.width = '350px';
        modal.style.zIndex = '9999';
        
        modalContent.style.height = '60px';
        modalContent.style.overflow = 'hidden';
        
        // Hide body content, keep only header
        const modalBody = modal.querySelector('.modal-body') as HTMLElement;
        if (modalBody) modalBody.style.display = 'none';
        
        // Make entire modal clickable to restore
        modalHeader.style.cursor = 'pointer';
        modalHeader.style.userSelect = 'none';
        modalHeader.style.background = 'rgba(0,123,255,0.1)';
        modalHeader.style.border = '1px solid rgba(0,123,255,0.3)';
        modalHeader.style.borderRadius = '4px';
        modalHeader.title = 'Click to restore email';
        
        // Remove any existing event listeners to avoid duplicates
        if (restoreHandler) {
          modalHeader.removeEventListener('click', restoreHandler);
        }
        
        // Create new restore handler
        const newRestoreHandler = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Restore clicked'); // Debug log
          handleRestore();
        };
        
        modalHeader.addEventListener('click', newRestoreHandler);
        setRestoreHandler(() => newRestoreHandler);
        
        setIsMinimized(true);
        toast.info('Email minimized to corner');
      } else {
        handleRestore();
      }
    }
  };

  const handleRestore = () => {
    const modal = document.querySelector('.compose-mail .modal-dialog') as HTMLElement;
    const modalContent = document.querySelector('.compose-mail .modal-content') as HTMLElement;
    const modalHeader = document.querySelector('.compose-mail .modal-header') as HTMLElement;
    
    if (modal && modalContent && modalHeader) {
      // Restore: back to center
      modal.style.transition = 'all 0.3s ease-in-out';
      modal.style.position = 'relative';
      modal.style.bottom = 'auto';
      modal.style.right = 'auto';
      modal.style.top = 'auto';
      modal.style.left = 'auto';
      modal.style.margin = '1.75rem auto';
      modal.style.maxWidth = '800px';
      modal.style.width = 'auto';
      modal.style.zIndex = 'auto';
      
      modalContent.style.height = 'auto';
      modalContent.style.overflow = 'visible';
      
      // Show body content
      const modalBody = modal.querySelector('.modal-body') as HTMLElement;
      if (modalBody) modalBody.style.display = 'block';
      
      // Remove header click handler
      if (restoreHandler) {
        modalHeader.removeEventListener('click', restoreHandler);
        setRestoreHandler(null);
      }
      
      modalHeader.style.cursor = 'default';
      modalHeader.style.userSelect = 'auto';
      modalHeader.style.background = '';
      modalHeader.style.border = '';
      modalHeader.style.borderRadius = '';
      modalHeader.title = '';
      
      setIsMinimized(false);
      toast.info('Email restored');
    }
  };

     const handleMaximize = () => {
     const modal = document.querySelector('.compose-mail .modal-dialog');
     if (modal) {
       if (!(modal as HTMLElement).classList.contains('modal-xl')) {
         (modal as HTMLElement).classList.add('modal-xl');
         toast.success('Email maximized');
       } else {
         (modal as HTMLElement).classList.remove('modal-xl');
         toast.success('Email restored to normal size');
       }
     }
   };

   // Handle schedule email
   const handleScheduleEmail = () => {
     if (!scheduleDateTime.date || !scheduleDateTime.time) {
       toast.error('Please select both date and time');
       return;
     }

     const scheduledDateTime = new Date(`${scheduleDateTime.date}T${scheduleDateTime.time}`);
     const now = new Date();

     if (scheduledDateTime <= now) {
       toast.error('Please select a future date and time');
       return;
     }

     toast.success(`Email scheduled for ${scheduledDateTime.toLocaleString()}`);
     setShowScheduleModal(false);
     setScheduleDateTime({ date: '', time: '' });
   };

   // Get minimum date (today)
   const getMinDate = () => {
     const today = new Date();
     return today.toISOString().split('T')[0];
   };

   // Get minimum time (current time if today is selected)
   const getMinTime = () => {
     const today = new Date();
     const selectedDate = new Date(scheduleDateTime.date);
     
     if (selectedDate.toDateString() === today.toDateString()) {
       const hours = String(today.getHours()).padStart(2, '0');
       const minutes = String(today.getMinutes()).padStart(2, '0');
       return `${hours}:${minutes}`;
     }
     return '';
   };

  return (
    <>
      <div>
        <div className="bg-body-secondary card-body d-flex justify-content-between gap-1">
          <button
            type="button"
            onClick={toggleCompase}
            className="btn btn-danger w-100 d-flex align-items-center  justify-content-center"
            data-bs-toggle="modal"
            data-bs-target="#compose-modal"
          >
            <span className="fw-semibold">
              <IconifyIcon
                icon="solar:pen-new-square-broken"
                className="align-middle me-1 fs-16"
              />
              Compose
            </span>
          </button>
          <button
            type="button"
            className="btn btn-icon btn-soft-danger d-xl-none"
            data-bs-dismiss="offcanvas"
            data-bs-target="#offcanvasExample"
            aria-label="Close"
          >
            <IconifyIcon icon="ri:close-line" className="fs-22" />
          </button>
        </div>
      </div>
              <Modal
        size="lg"
        className="fade compose-mail"
        show={compaseTrue}
        onHide={toggleCompase}
        style={{ zIndex: 1055 }}
      >
        <ModalHeader className="overflow-hidden bg-primary p-2">
          <h5 className="modal-title text-white" id="compose-modalLabel">
            New Message
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={toggleCompase}
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </ModalHeader>
        <ModalBody className="p-0">
                     <div className="compose-email-form">
             {/* Recipients Section */}
             <div className="border-bottom p-3" style={{ backgroundColor: '#fafafa' }}>
              <div className="d-flex align-items-center mb-2">
                <span className="text-muted me-3" style={{ minWidth: '40px' }}>To</span>
                <input
                  type="email"
                  className="form-control border-0"
                  placeholder="Recipients"
                  style={{ boxShadow: 'none' }}
                  value={emailForm.to}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                />
                <div className="d-flex gap-1 ms-2">
                  <span 
                    className="text-primary cursor-pointer small"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const ccRow = document.getElementById('cc-row');
                      if (ccRow) ccRow.style.display = ccRow.style.display === 'none' ? 'flex' : 'none';
                    }}
                  >
                    Cc
                  </span>
                  <span 
                    className="text-primary cursor-pointer small ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const bccRow = document.getElementById('bcc-row');
                      if (bccRow) bccRow.style.display = bccRow.style.display === 'none' ? 'flex' : 'none';
                    }}
                  >
                    Bcc
                  </span>
                </div>
              </div>
              
              <div id="cc-row" className="d-flex align-items-center mb-2" style={{ display: 'none' }}>
                <span className="text-muted me-3" style={{ minWidth: '40px' }}>Cc</span>
                <input
                  type="email"
                  className="form-control border-0"
                  placeholder="Carbon copy"
                  style={{ boxShadow: 'none' }}
                  value={emailForm.cc}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, cc: e.target.value }))}
                />
              </div>
              
              <div id="bcc-row" className="d-flex align-items-center mb-2" style={{ display: 'none' }}>
                <span className="text-muted me-3" style={{ minWidth: '40px' }}>Bcc</span>
                <input
                  type="email"
                  className="form-control border-0"
                  placeholder="Blind carbon copy"
                  style={{ boxShadow: 'none' }}
                  value={emailForm.bcc}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, bcc: e.target.value }))}
                />
              </div>
              
              <div className="d-flex align-items-center">
                <span className="text-muted me-3" style={{ minWidth: '40px' }}>Subject</span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Subject"
                  style={{ boxShadow: 'none' }}
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
            </div>

            {/* Message Body */}
            <div className="p-3" style={{ minHeight: '250px' }}>
              <textarea
                id="compose-message"
                className="form-control border-0 w-100 h-100"
                placeholder="Compose email..."
                style={{ 
                  minHeight: '200px',
                  resize: 'none',
                  boxShadow: 'none',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            {/* Attachments Area */}
                         <div id="attachments-area" className="px-3" style={{ display: 'none' }}>
               <div className="border rounded p-2 mb-3 bg-light">
                 <div className="d-flex align-items-center">
                   <IconifyIcon icon="solar:paperclip-broken" className="text-muted me-2" />
                   <span className="small text-muted">No attachments</span>
                 </div>
                 <input type="file" id="attachment-input" multiple className="d-none" onChange={handleFileAttachment} />
               </div>
             </div>

            {/* Bottom Toolbar */}
            <div className="border-top p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                                    <Button 
                    variant="primary" 
                    className="d-flex align-items-center gap-2 px-3"
                    style={{ 
                      height: '38px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                    onClick={handleSendEmail}
                    disabled={isSending}
                  >
                    <IconifyIcon icon={isSending ? "ri:loader-4-line" : "ri:send-plane-fill"} 
                                 style={{ fontSize: '20px' }} 
                                 className={isSending ? "spin" : ""} />
                    {isSending ? 'Sending...' : 'Send'}
                  </Button>
                  
                                     <div className="d-flex align-items-center gap-3">
                     <span
                       title="Attach files"
                       style={{ cursor: 'pointer' }}
                       onClick={() => {
                         document.getElementById('attachment-input')?.click();
                         const attachArea = document.getElementById('attachments-area');
                         if (attachArea) attachArea.style.display = 'block';
                       }}
                     >
                       <IconifyIcon 
                         icon="ri:attachment-2" 
                         className="text-muted" 
                         style={{ fontSize: '28px' }}
                       />
                     </span>
                     
                     <span title="Insert link" style={{ cursor: 'pointer' }} onClick={handleInsertLink}>
                       <IconifyIcon 
                         icon="ri:link-m" 
                         className="text-muted" 
                         style={{ fontSize: '28px' }}
                       />
                     </span>
                     
                     <span title="Insert emoji" style={{ cursor: 'pointer' }} onClick={handleInsertEmoji}>
                       <IconifyIcon 
                         icon="ri:emotion-happy-fill" 
                         className="text-muted" 
                         style={{ fontSize: '28px' }}
                       />
                     </span>
                     
                     <span title="Insert photo" style={{ cursor: 'pointer' }} onClick={handlePhotoAttachment}>
                       <IconifyIcon 
                         icon="ri:image-add-fill" 
                         className="text-muted" 
                         style={{ fontSize: '28px' }}
                       />
                     </span>

                     <Dropdown>
                       <DropdownToggle
                         className="bg-transparent border-0 p-0"
                         style={{ boxShadow: 'none' }}
                         title="More options"
                       >
                         <IconifyIcon 
                           icon="ri:more-2-fill" 
                           className="text-muted" 
                           style={{ fontSize: '28px' }}
                         />
                       </DropdownToggle>
                                             <DropdownMenu className="dropdown-menu-end">
                         <DropdownItem 
                           className="d-flex align-items-center py-2"
                           onClick={() => setShowScheduleModal(true)}
                         >
                           <IconifyIcon icon="ri:calendar-schedule-line" className="me-2 text-muted" style={{ fontSize: '18px' }} />
                           <span>Schedule send</span>
                         </DropdownItem>
                         <DropdownItem 
                           className="d-flex align-items-center py-2"
                           onClick={() => {
                             const isConfidential = confirm('Enable confidential mode? Recipients will need to verify their identity.');
                             if (isConfidential) {
                               toast.success('Confidential mode enabled - email will require verification');
                             }
                           }}
                         >
                           <IconifyIcon icon="ri:shield-check-line" className="me-2 text-muted" style={{ fontSize: '18px' }} />
                           <span>Confidential mode</span>
                         </DropdownItem>
                         <DropdownItem 
                           className="d-flex align-items-center py-2"
                           onClick={() => {
                             const labelName = prompt('Enter label name:');
                             if (labelName) {
                               toast.success(`Label "${labelName}" will be added to this email`);
                             }
                           }}
                         >
                           <IconifyIcon icon="ri:price-tag-3-line" className="me-2 text-muted" style={{ fontSize: '18px' }} />
                           <span>Add label</span>
                         </DropdownItem>
                       </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                
                 <div className="d-flex align-items-center gap-3">
                   <span title={isMinimized ? "Restore" : "Minimize"} style={{ cursor: 'pointer' }} onClick={handleMinimize}>
                     <IconifyIcon 
                       icon={isMinimized ? "ri:window-line" : "ri:subtract-line"} 
                       className="text-muted" 
                       style={{ fontSize: '28px' }} 
                     />
                   </span>
                   <span title="Maximize" style={{ cursor: 'pointer' }} onClick={handleMaximize}>
                     <IconifyIcon icon="ri:fullscreen-line" className="text-muted" style={{ fontSize: '28px' }} />
                   </span>
                   <span title="Delete draft" style={{ cursor: 'pointer' }} onClick={toggleCompase}>
                     <IconifyIcon icon="ri:delete-bin-2-fill" className="text-danger" style={{ fontSize: '28px' }} />
                   </span>
                 </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Create New Label Modal */}
      <Modal show={showCreateLabel} onHide={toggleCreateLabel}>
        <ModalHeader closeButton>
          <h5 className="modal-title">Create New Label</h5>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Label Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter label name"
              value={newLabel.name}
              onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Label Color</label>
            <div className="d-flex gap-2 flex-wrap">
              {[
                { name: 'primary', color: '#007bff' },
                { name: 'success', color: '#28a745' },
                { name: 'warning', color: '#ffc107' },
                { name: 'danger', color: '#dc3545' },
                { name: 'info', color: '#17a2b8' },
                { name: 'purple', color: '#6f42c1' },
                { name: 'orange', color: '#fd7e14' },
                { name: 'pink', color: '#e83e8c' }
              ].map((colorOption) => (
                <div
                  key={colorOption.name}
                  className={`border rounded p-2 cursor-pointer ${newLabel.color === colorOption.name ? 'border-3 border-dark' : 'border-1'}`}
                  style={{ 
                    backgroundColor: colorOption.color, 
                    width: '30px', 
                    height: '30px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setNewLabel(prev => ({ ...prev, color: colorOption.name }))}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" onClick={toggleCreateLabel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateLabel}>
              Create Label
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Schedule Email Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)}>
        <ModalHeader closeButton>
          <h5 className="modal-title">Schedule Email</h5>
        </ModalHeader>
        <ModalBody>
          <div className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <IconifyIcon icon="ri:calendar-line" className="me-2 text-primary fs-4" />
              <h6 className="mb-0">Choose when to send this email</h6>
            </div>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <IconifyIcon icon="ri:calendar-2-line" className="me-1" />
                  Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={getMinDate()}
                  value={scheduleDateTime.date}
                  onChange={(e) => setScheduleDateTime(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <IconifyIcon icon="ri:time-line" className="me-1" />
                  Time
                </label>
                <input
                  type="time"
                  className="form-control"
                  min={getMinTime()}
                  value={scheduleDateTime.time}
                  onChange={(e) => setScheduleDateTime(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            {scheduleDateTime.date && scheduleDateTime.time && (
              <div className="mt-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="ri:send-plane-2-line" className="me-2 text-success" />
                  <div>
                    <strong>Email will be sent on:</strong>
                    <p className="mb-0 text-muted">
                      {new Date(`${scheduleDateTime.date}T${scheduleDateTime.time}`).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleScheduleEmail}
              disabled={!scheduleDateTime.date || !scheduleDateTime.time}
            >
              <IconifyIcon icon="ri:calendar-check-line" className="me-1" />
              Schedule Email
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <SimplebarReactClient style={{ height: "calc(100vh - 280px)" }}>
        <CardBody className="pt-0">
          <div className="email-menu-list d-flex flex-column gap-2">
            <Link
              href=""
              className={activeLabel === "inbox" ? "active" : ""}
              onClick={() => changeActiveLabel("inbox")}
            >
              <IconifyIcon
                icon="solar:inbox-broken"
                className="me-2 fs-18 text-muted"
              />
              <span>Your Inbox</span>
              <span className="fs-12 text-primary ms-auto">{emailsCount.inbox}</span>
            </Link>
            <Link 
              href=""
              className={activeLabel === "important" ? "active" : ""}
              onClick={() => changeActiveLabel("important")}
            >
              <IconifyIcon
                icon="solar:bookmark-broken"
                className="me-2 fs-18 text-muted"
              />
              <span>Important</span>
              {emailsCount.important > 0 && (
                <span className="fs-12 text-muted ms-auto">{emailsCount.important}</span>
              )}
            </Link>
            <Link 
              href=""
              className={activeLabel === "snoozed" ? "active" : ""}
              onClick={() => changeActiveLabel("snoozed")}
            >
              <IconifyIcon
                icon="solar:stopwatch-play-broken"
                className="me-2 fs-18 text-muted"
              />
              <span>Snoozed</span>
              {emailsCount.snoozed > 0 && (
                <span className="fs-12 text-muted ms-auto">{emailsCount.snoozed}</span>
              )}
            </Link>
            <Link 
              href=""
              className={activeLabel === "draft" ? "active" : ""}
              onClick={() => changeActiveLabel("draft")}
            >
              <IconifyIcon
                icon="solar:pen-2-broken"
                className="me-2 fs-18 text-muted"
              />
              <span>Draft</span>
              <span className="fs-12 text-muted ms-auto">{emailsCount.draft}</span>
            </Link>
            <Link 
              href=""
              className={activeLabel === "sent" ? "active" : ""}
              onClick={() => changeActiveLabel("sent")}
            >
              <IconifyIcon
                icon="solar:file-send-broken"
                className="me-2 fs-18 text-muted"
              />
              <span>Sent</span>
              {emailsCount.sent > 0 && (
                <span className="fs-12 text-muted ms-auto">{emailsCount.sent}</span>
              )}
            </Link>
            <Link 
              href=""
              className={activeLabel === "Promotions" ? "active" : ""}
              onClick={() => changeActiveLabel("Promotions")}
            >
              <IconifyIcon
                icon="solar:bag-3-broken"
                className="me-2 fs-18 text-muted"
              />
              <span>Promotions</span>
              <span className="fs-12 text-muted ms-auto">{emailsCount.promotions}</span>
            </Link>
            <Link 
              href=""
              className={activeLabel === "Updates" ? "active" : ""}
              onClick={() => changeActiveLabel("Updates")}
            >
              <IconifyIcon
                icon="solar:bell-bing-broken"
                className="me-2 fs-18 text-muted"
              />
              <span>Update</span>
              <span className="fs-12 text-muted ms-auto">{emailsCount.updates}</span>
            </Link>
            <span
              onClick={toggleMore}
              className="btn-link d-flex align-items-center text-dark fw-semibold mb-0 cursor-pointer"
              style={{ cursor: "pointer" }}
            >
              <IconifyIcon 
                icon={isMoreOpen ? "ri:arrow-down-s-line" : "ri:arrow-right-s-line"} 
                className="me-1" 
              />
              More
            </span>
            <Collapse in={isMoreOpen}>
              <div>
                <div className="email-menu-list d-flex flex-column gap-2 mt-2">
                  <Link 
                    href=""
                    className={activeLabel === "spam" ? "active" : ""}
                    onClick={() => changeActiveLabel("spam")}
                  >
                    <IconifyIcon
                      icon="solar:shield-warning-broken"
                      className="me-2 fs-18 text-muted"
                    />
                    <span>Spam</span>
                    {userData.filter(u => u.emailFolder === "spam").length > 0 && (
                      <span className="fs-12 text-muted ms-auto">
                        {userData.filter(u => u.emailFolder === "spam").length}
                      </span>
                    )}
                  </Link>
                  <Link 
                    href=""
                    className={activeLabel === "archive" ? "active" : ""}
                    onClick={() => changeActiveLabel("archive")}
                  >
                    <IconifyIcon
                      icon="solar:archive-broken"
                      className="me-2 fs-18 text-muted"
                    />
                    <span>Archive</span>
                    {userData.filter(u => u.emailFolder === "archive").length > 0 && (
                      <span className="fs-12 text-muted ms-auto">
                        {userData.filter(u => u.emailFolder === "archive").length}
                      </span>
                    )}
                  </Link>
                  <Link 
                    href=""
                    className={activeLabel === "deleted" ? "active" : ""}
                    onClick={() => changeActiveLabel("deleted")}
                  >
                    <IconifyIcon
                      icon="solar:trash-bin-2-broken"
                      className="me-2 fs-18 text-muted"
                    />
                    <span>Trash</span>
                    {emailsCount.deleted > 0 && (
                      <span className="fs-12 text-muted ms-auto">{emailsCount.deleted}</span>
                    )}
                  </Link>
                </div>
              </div>
            </Collapse>
          </div>
        </CardBody>
        <CardBody className="border-top border-light">
          <span
            onClick={toggleCollapse}
            className="btn-link d-flex align-items-center text-dark fw-semibold  mb-0"
            data-bs-toggle="collapse"
            data-bs-target="#labels"
            aria-expanded="false"
            aria-controls="labels"
          >
            Labels{" "}
            <IconifyIcon icon="ri:arrow-down-s-line" className="ms-auto" />
          </span>
          <Collapse in={isTrue}>
            <div>
              <div className="email-menu-list d-flex flex-column gap-2 mt-2">
                <Link 
                  href=""
                  className={activeLabel === "label:Collaboration" ? "active" : ""}
                  onClick={() => changeActiveLabel("label:Collaboration")}
                >
                  <IconifyIcon
                    icon="solar:camera-square-bold"
                    className="me-2 fs-18 text-success"
                  />
                  <span>Collaboration</span>
                  {labelCounts.Collaboration > 0 && (
                    <span className="fs-12 text-muted ms-auto">{labelCounts.Collaboration}</span>
                  )}
                </Link>
                <Link 
                  href=""
                  className={activeLabel === "label:New Client" ? "active" : ""}
                  onClick={() => changeActiveLabel("label:New Client")}
                >
                  <IconifyIcon
                    icon="solar:camera-square-bold"
                    className="me-2 fs-18 text-warning"
                  />
                  <span>New Client</span>
                  {labelCounts["New Client"] > 0 && (
                    <span className="fs-12 text-muted ms-auto">{labelCounts["New Client"]}</span>
                  )}
                </Link>
                <Link 
                  href=""
                  className={activeLabel === "label:Wedding" ? "active" : ""}
                  onClick={() => changeActiveLabel("label:Wedding")}
                >
                  <IconifyIcon
                    icon="solar:camera-square-bold"
                    className="me-2 fs-18 text-info"
                  />
                  <span>Wedding</span>
                  {labelCounts.Wedding > 0 && (
                    <span className="fs-12 text-muted ms-auto">{labelCounts.Wedding}</span>
                  )}
                </Link>
                
                {/* Custom Labels */}
                {customLabels.map((label, idx) => (
                  <Link 
                    key={idx}
                    href=""
                    className={activeLabel === `label:${label.name}` ? "active" : ""}
                    onClick={() => changeActiveLabel(`label:${label.name}`)}
                  >
                    <IconifyIcon
                      icon="solar:tag-bold"
                      className={`me-2 fs-18 text-${label.color}`}
                    />
                    <span>{label.name}</span>
                    <span className="fs-12 text-muted ms-auto">0</span>
                  </Link>
                ))}
                
                {/* Create New Label */}
                <Link 
                  href=""
                  onClick={toggleCreateLabel}
                  className="text-muted hover-text-primary d-flex align-items-center"
                  style={{ cursor: 'pointer' }}
                >
                  <IconifyIcon
                    icon="solar:add-circle-broken"
                    className="me-2 fs-18 text-muted"
                  />
                  <span>Create new label</span>
                </Link>
              </div>
            </div>
          </Collapse>
        </CardBody>
        <CardBody className="border-top border-light">
          <Link
            href=""
            onClick={toggleContact}
            className="btn-link d-flex align-items-center text-dark fw-semibold  mb-0"
            data-bs-toggle="collapse"
            data-bs-target="#contacts"
            aria-expanded="false"
            aria-controls="contacts"
          >
            Contacts{" "}
            <IconifyIcon icon="ri:arrow-down-s-line" className="ms-auto" />
          </Link>
          <Collapse in={isOpenContact}>
            <div>
              <div className="email-menu-list d-flex flex-column gap-1 mt-2">
                {inboxUser?.slice(0, 4).map((user, idx) => (
                  <Link 
                    href="" 
                    key={idx}
                    className={activeLabel === `contact:${user.id}` ? "active" : ""}
                    onClick={() => changeActiveLabel(`contact:${user.id}`)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Image
                        src={user.avatar}
                        alt="avatar"
                        className="avatar-sm rounded-circle"
                      />
                      <p className="mb-0">{user.name}</p>
                      <div className="ms-auto">
                        <span className="badge bg-success-subtle text-success rounded-pill">
                          {userData.filter(u => u.id === user.id).length}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Collapse>
        </CardBody>
      </SimplebarReactClient>
    </>
  );
};

const EmailNavigationMenu = () => {
  const { composeEmail } = useEmailContext();
  const { width } = useViewPort();
  const {
    navigationBar: { open, toggle },
  } = useEmailContext();
  return width > 1400 ? (
    <NavBar />
  ) : (
    <Offcanvas
      show={composeEmail.open}
      onHide={composeEmail.toggle}
      placement="start"
      className="offcanvas-xl"
    >
      <NavBar />
    </Offcanvas>
  );
};

export default EmailNavigationMenu;
