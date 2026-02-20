import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

// Type definitions matching UI interfaces
export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'safety' | 'technology' | 'communication' | 'emergency';
  duration: number; // hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isRequired: boolean;
  validityPeriod: number; // months
  instructor: string;
  maxParticipants: number;
  cost: number;
  materials: string[];
  prerequisites: string[];
  status: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

export interface GuardTraining {
  id: string;
  guardId: string;
  guardName: string;
  programId: string;
  programName: string;
  enrollmentDate: string;
  startDate: string;
  completionDate?: string;
  expiryDate?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'expired' | 'cancelled';
  score?: number;
  instructor: string;
  certificateUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuardCertification {
  id: string;
  guardId: string;
  guardName: string;
  certificationType: string;
  issuingAuthority: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'renewed';
  documentUrl?: string;
  renewalRequired: boolean;
  reminderSent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainingProgramData {
  name: string;
  description: string;
  category: TrainingProgram['category'];
  duration: number;
  difficulty: TrainingProgram['difficulty'];
  isRequired: boolean;
  validityPeriod: number;
  instructor: string;
  maxParticipants: number;
  cost: number;
  materials: string[];
  prerequisites: string[];
}

export interface CreateGuardTrainingData {
  guardId: string;
  programId: string;
  startDate: string;
  notes?: string;
}

export interface CreateCertificationData {
  guardId: string;
  certificationType: string;
  issuingAuthority: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
}

export interface TrainingStats {
  totalPrograms: number;
  activePrograms: number;
  totalTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  totalCertifications: number;
  validCertifications: number;
  expiringSoon: number;
  expired: number;
  completionRate: number;
  averageScore: number;
}

// Transform functions
const transformDbTrainingProgramToUI = (dbProgram: any): TrainingProgram => ({
  id: dbProgram.id,
  name: dbProgram.name,
  description: dbProgram.description,
  category: dbProgram.category,
  duration: dbProgram.duration,
  difficulty: dbProgram.difficulty,
  isRequired: dbProgram.is_required,
  validityPeriod: dbProgram.validity_period,
  instructor: dbProgram.instructor,
  maxParticipants: dbProgram.max_participants,
  cost: parseFloat(dbProgram.cost || '0'),
  materials: dbProgram.materials || [],
  prerequisites: dbProgram.prerequisites || [],
  status: dbProgram.status,
  createdAt: dbProgram.created_at,
  updatedAt: dbProgram.updated_at,
});

const transformDbGuardTrainingToUI = (dbTraining: any): GuardTraining => ({
  id: dbTraining.id,
  guardId: dbTraining.guard_id,
  guardName: dbTraining.guard_name,
  programId: dbTraining.program_id,
  programName: dbTraining.program_name,
  enrollmentDate: dbTraining.enrollment_date,
  startDate: dbTraining.start_date,
  completionDate: dbTraining.completion_date,
  expiryDate: dbTraining.expiry_date,
  status: dbTraining.status,
  score: dbTraining.score,
  instructor: dbTraining.instructor,
  certificateUrl: dbTraining.certificate_url,
  notes: dbTraining.notes,
  createdAt: dbTraining.created_at,
  updatedAt: dbTraining.updated_at,
});

const transformDbCertificationToUI = (dbCert: any): GuardCertification => ({
  id: dbCert.id,
  guardId: dbCert.guard_id,
  guardName: dbCert.guard_name,
  certificationType: dbCert.certificate_type,
  issuingAuthority: dbCert.issuing_authority,
  certificateNumber: dbCert.certificate_number,
  issueDate: dbCert.issue_date,
  expiryDate: dbCert.expiry_date,
  status: dbCert.status,
  documentUrl: dbCert.document_url,
  renewalRequired: dbCert.renewal_required,
  reminderSent: dbCert.reminder_sent,
  createdAt: dbCert.created_at,
  updatedAt: dbCert.updated_at,
});

// Training Programs Hooks
export const useTrainingPrograms = (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['training-programs', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('training_programs')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching training programs:', error);
          throw new Error(`Failed to fetch training programs: ${error.message}`);
        }

        return data?.map(transformDbTrainingProgramToUI) || [];
      } catch (error) {
        console.error('Error in useTrainingPrograms:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTrainingProgramData) => {
      const { data: result, error } = await supabase
        .from('training_programs')
        .insert({
          name: data.name,
          description: data.description,
          category: data.category,
          duration: data.duration,
          difficulty: data.difficulty,
          is_required: data.isRequired,
          validity_period: data.validityPeriod,
          instructor: data.instructor,
          max_participants: data.maxParticipants,
          cost: data.cost,
          materials: data.materials,
          prerequisites: data.prerequisites,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return transformDbTrainingProgramToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      toast.success('Training program created successfully');
    },
    onError: (error) => {
      console.error('Error creating training program:', error);
      toast.error('Failed to create training program');
    },
  });
};

export const useUpdateTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTrainingProgramData> }) => {
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
      if (data.isRequired !== undefined) updateData.is_required = data.isRequired;
      if (data.validityPeriod !== undefined) updateData.validity_period = data.validityPeriod;
      if (data.instructor !== undefined) updateData.instructor = data.instructor;
      if (data.maxParticipants !== undefined) updateData.max_participants = data.maxParticipants;
      if (data.cost !== undefined) updateData.cost = data.cost;
      if (data.materials !== undefined) updateData.materials = data.materials;
      if (data.prerequisites !== undefined) updateData.prerequisites = data.prerequisites;

      const { data: result, error } = await supabase
        .from('training_programs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbTrainingProgramToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      toast.success('Training program updated successfully');
    },
    onError: (error) => {
      console.error('Error updating training program:', error);
      toast.error('Failed to update training program');
    },
  });
};

export const useDeleteTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      toast.success('Training program deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting training program:', error);
      toast.error('Failed to delete training program');
    },
  });
};

// Guard Trainings Hooks
export const useGuardTrainings = (filters?: {
  status?: string;
  guardId?: string;
  programId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['guard-trainings', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('guard_trainings')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters?.guardId) {
          query = query.eq('guard_id', filters.guardId);
        }

        if (filters?.programId) {
          query = query.eq('program_id', filters.programId);
        }

        if (filters?.search) {
          query = query.or(`guard_name.ilike.%${filters.search}%,program_name.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching guard trainings:', error);
          throw new Error(`Failed to fetch guard trainings: ${error.message}`);
        }

        return data?.map(transformDbGuardTrainingToUI) || [];
      } catch (error) {
        console.error('Error in useGuardTrainings:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateGuardTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGuardTrainingData) => {
      // Get guard and program details first
      const [guardResult, programResult] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name').eq('id', data.guardId).single(),
        supabase.from('training_programs').select('name, instructor').eq('id', data.programId).single()
      ]);

      if (guardResult.error) throw guardResult.error;
      if (programResult.error) throw programResult.error;

      const guardName = `${guardResult.data.first_name} ${guardResult.data.last_name}`;
      const programName = programResult.data.name;
      const instructor = programResult.data.instructor;

      const { data: result, error } = await supabase
        .from('guard_trainings')
        .insert({
          guard_id: data.guardId,
          guard_name: guardName,
          program_id: data.programId,
          program_name: programName,
          start_date: data.startDate,
          instructor: instructor,
          notes: data.notes,
          status: 'enrolled',
        })
        .select()
        .single();

      if (error) throw error;
      return transformDbGuardTrainingToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard-trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      toast.success('Guard enrolled in training successfully');
    },
    onError: (error) => {
      console.error('Error enrolling guard in training:', error);
      toast.error('Failed to enroll guard in training');
    },
  });
};

export const useUpdateGuardTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GuardTraining> }) => {
      const updateData: any = {};
      
      if (data.startDate !== undefined) updateData.start_date = data.startDate;
      if (data.completionDate !== undefined) updateData.completion_date = data.completionDate;
      if (data.expiryDate !== undefined) updateData.expiry_date = data.expiryDate;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.score !== undefined) updateData.score = data.score;
      if (data.certificateUrl !== undefined) updateData.certificate_url = data.certificateUrl;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: result, error } = await supabase
        .from('guard_trainings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbGuardTrainingToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard-trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      toast.success('Training updated successfully');
    },
    onError: (error) => {
      console.error('Error updating training:', error);
      toast.error('Failed to update training');
    },
  });
};

export const useUpdateTrainingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, score, completionDate, expiryDate, certificateUrl }: {
      id: string;
      status: GuardTraining['status'];
      score?: number;
      completionDate?: string;
      expiryDate?: string;
      certificateUrl?: string;
    }) => {
      const updateData: any = { status };
      
      if (score !== undefined) updateData.score = score;
      if (completionDate !== undefined) updateData.completion_date = completionDate;
      if (expiryDate !== undefined) updateData.expiry_date = expiryDate;
      if (certificateUrl !== undefined) updateData.certificate_url = certificateUrl;

      const { data: result, error } = await supabase
        .from('guard_trainings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbGuardTrainingToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard-trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      toast.success('Training status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating training status:', error);
      toast.error('Failed to update training status');
    },
  });
};

export const useDeleteGuardTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guard_trainings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard-trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      toast.success('Training enrollment cancelled successfully');
    },
    onError: (error) => {
      console.error('Error cancelling training enrollment:', error);
      toast.error('Failed to cancel training enrollment');
    },
  });
};

// Guard Certifications Hooks
export const useGuardCertifications = (filters?: {
  status?: string;
  guardId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['guard-certifications', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('guard_certifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters?.guardId) {
          query = query.eq('guard_id', filters.guardId);
        }

        if (filters?.search) {
          query = query.or(`guard_name.ilike.%${filters.search}%,certificate_type.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching guard certifications:', error);
          throw new Error(`Failed to fetch guard certifications: ${error.message}`);
        }

        return data?.map(transformDbCertificationToUI) || [];
      } catch (error) {
        console.error('Error in useGuardCertifications:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateGuardCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCertificationData) => {
      // Get guard details first
      const { data: guardData, error: guardError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.guardId)
        .single();

      if (guardError) throw guardError;

      const guardName = `${guardData.first_name} ${guardData.last_name}`;

      const { data: result, error } = await supabase
        .from('guard_certifications')
        .insert({
          guard_id: data.guardId,
          guard_name: guardName,
          certificate_type: data.certificationType,
          issuing_authority: data.issuingAuthority,
          certificate_number: data.certificateNumber,
          issue_date: data.issueDate,
          expiry_date: data.expiryDate,
          document_url: data.documentUrl,
          status: 'valid',
          renewal_required: false,
          reminder_sent: false,
        })
        .select()
        .single();

      if (error) throw error;
      return transformDbCertificationToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard-certifications'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      toast.success('Certification added successfully');
    },
    onError: (error) => {
      console.error('Error creating certification:', error);
      toast.error('Failed to add certification');
    },
  });
};

export const useUpdateCertificationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, renewalRequired, reminderSent }: {
      id: string;
      status: GuardCertification['status'];
      renewalRequired?: boolean;
      reminderSent?: boolean;
    }) => {
      const updateData: any = { status };
      
      if (renewalRequired !== undefined) updateData.renewal_required = renewalRequired;
      if (reminderSent !== undefined) updateData.reminder_sent = reminderSent;

      const { data: result, error } = await supabase
        .from('guard_certifications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbCertificationToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guard-certifications'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      toast.success('Certification status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating certification status:', error);
      toast.error('Failed to update certification status');
    },
  });
};

// Training Statistics Hook
export const useTrainingStats = () => {
  return useQuery({
    queryKey: ['training-stats'],
    queryFn: async () => {
      try {
        const [programsResult, trainingsResult, certificationsResult] = await Promise.all([
          supabase.from('training_programs').select('status'),
          supabase.from('guard_trainings').select('status, score'),
          supabase.from('guard_certifications').select('status')
        ]);

        if (programsResult.error) throw programsResult.error;
        if (trainingsResult.error) throw trainingsResult.error;
        if (certificationsResult.error) throw certificationsResult.error;

        const programs = programsResult.data || [];
        const trainings = trainingsResult.data || [];
        const certifications = certificationsResult.data || [];

        const totalPrograms = programs.length;
        const activePrograms = programs.filter(p => p.status === 'active').length;
        
        const totalTrainings = trainings.length;
        const completedTrainings = trainings.filter(t => t.status === 'completed').length;
        const inProgressTrainings = trainings.filter(t => t.status === 'in_progress').length;
        
        const totalCertifications = certifications.length;
        const validCertifications = certifications.filter(c => c.status === 'valid').length;
        const expiringSoon = certifications.filter(c => c.status === 'expiring_soon').length;
        const expired = certifications.filter(c => c.status === 'expired').length;
        
        const completionRate = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;
        
        const scores = trainings.filter(t => t.score !== null).map(t => t.score);
        const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

        const stats: TrainingStats = {
          totalPrograms,
          activePrograms,
          totalTrainings,
          completedTrainings,
          inProgressTrainings,
          totalCertifications,
          validCertifications,
          expiringSoon,
          expired,
          completionRate,
          averageScore,
        };

        return stats;
      } catch (error) {
        console.error('Error fetching training stats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Real-time subscription hook
export const useGuardTrainingRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const trainingChannel = supabase
      .channel('public:guard_trainings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guard_trainings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['guard-trainings'] });
        queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      })
      .subscribe();

    const programChannel = supabase
      .channel('public:training_programs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_programs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['training-programs'] });
        queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      })
      .subscribe();

    const certificationChannel = supabase
      .channel('public:guard_certifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guard_certifications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['guard-certifications'] });
        queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(trainingChannel);
      supabase.removeChannel(programChannel);
      supabase.removeChannel(certificationChannel);
    };
  }, [queryClient]);
}; 