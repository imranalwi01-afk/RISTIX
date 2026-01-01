import re

file_path = 'packages/frontend/src/services/api.ts'

with open(file_path, 'r') as f:
    content = f.read()

class BraceCounter:
    def __init__(self, content):
        self.content = content

    def replace_block(self, start_marker, new_block):
        start_idx = self.content.find(start_marker)
        if start_idx == -1:
            print(f"Could not find start marker: {start_marker}")
            return self.content

        open_brace_idx = self.content.find('{', start_idx)
        
        counter = 1
        i = open_brace_idx + 1
        while i < len(self.content) and counter > 0:
            if self.content[i] == '{':
                counter += 1
            elif self.content[i] == '}':
                counter -= 1
            i += 1
        
        end_idx = i
        if i < len(self.content) and self.content[i] == ',':
            end_idx += 1
            
        print(f"Replacing block from index {start_idx} to {end_idx}")
        return self.content[:start_idx] + new_block + self.content[end_idx:]

new_segmentation = """  segmentation: {
    // Header Operations
    getHeaders: async (params?: { page?: number; limit?: number; search?: string }) => {
      console.log('🎯 Fetching segmentation headers from DS2 database');
      const response = await apiClient.get('/banking/setup/segmentation', { params });
      return response.data;
    },

    getHeader: async (id: number) => {
      console.log(`📄 Fetching segmentation header ${id} from DS2 database`);
      const response = await apiClient.get(`/banking/setup/segmentation/${id}`);
      return response.data;
    },

    createHeader: async (headerData: any) => {
      console.log('➕ Creating segmentation header in DS2 database');
      const response = await apiClient.post('/banking/setup/segmentation', headerData);
      return response.data;
    },

    updateHeader: async (id: number, headerData: any) => {
      console.log(`✏️ Updating segmentation header ${id} in DS2 database`);
      const response = await apiClient.put(`/banking/setup/segmentation/${id}`, headerData);
      return response.data;
    },

    deleteHeader: async (id: number) => {
      console.log(`🗑️ Deleting segmentation header ${id} from DS2 database`);
      const response = await apiClient.delete(`/banking/setup/segmentation/${id}`);
      return response.data;
    },

    // Detail Operations
    getDetails: async (headerId: number) => {
      console.log(`📋 Fetching segmentation details for header ${headerId} from DS2 database`);
      const response = await apiClient.get(`/banking/setup/segmentation/${headerId}/details`);
      return response.data;
    },

    createDetail: async (headerId: number, detailData: any) => {
      console.log(`➕ Creating segmentation detail for header ${headerId} in DS2 database`);
      const response = await apiClient.post(`/banking/setup/segmentation/${headerId}/details`, detailData);
      return response.data;
    },

    updateDetail: async (detailId: number, detailData: any) => {
      console.log(`✏️ Updating segmentation detail ${detailId} in DS2 database`);
      const response = await apiClient.put(`/banking/setup/segmentation/details/${detailId}`, detailData);
      return response.data;
    },

    deleteDetail: async (detailId: number) => {
      console.log(`🗑️ Deleting segmentation detail ${detailId} from DS2 database`);
      const response = await apiClient.delete(`/banking/setup/segmentation/details/${detailId}`);
      return response.data;
    },

    // Metadata
    getSegmentTypes: async () => {
      console.log('📋 Fetching segment types');
      const response = await apiClient.get('/banking/setup/segmentation/business-settings/segment-types');
      return response.data;
    }
  },"""

# Re-read file just in case
with open(file_path, 'r') as f:
    content = f.read()

replacer = BraceCounter(content)
new_content = replacer.replace_block("  segmentation: {", new_segmentation)

with open(file_path, 'w') as f:
    f.write(new_content)

print("Updated api.ts with comprehensive segmentation methods")
