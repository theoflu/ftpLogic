<script>
import UploadService from "@/assets/services/UploadFilesService";


export default {
  name:"DropFile",
  data() {
    return {
      isDragging: false,
      files: [],
      selectedFiles: undefined,
      progressInfos: [],
    };
  },
  methods: {
    onChange() {
      this.selectedFiles = event.target.files;
      this.progressInfos = [];
      const self = this;
      let incomingFiles = Array.from(this.$refs.file.files);
      const fileExist = self.files.some((r) =>
          incomingFiles.some(
              (file) => file.name === r.name && file.size === r.size
          )
      );
      if (fileExist) {
        self.showMessage = true;
        alert("New upload contains files that already exist");
      } else {
        self.files.push(...incomingFiles);
      }
    },
    uploadFiles() {
      this.message = "";

      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);

      }
    },
    upload(idx, file) {
      this.progressInfos[idx] = { percentage: 0, fileName: file.name };
      this.jwt=localStorage.getItem('accessToken');
      console.log(this.jwt)
      UploadService.upload(file, (event) => {
        this.progressInfos[idx].percentage = Math.round(100 * event.loaded / event.total);

      },this.jwt)
          .then((response) => {


            this.message =  response.data.processes;
            alert(this.message)

            location.reload();

          })
          .then((files) => {

            this.fileInfos = files.data;
          })
          .catch(() => {
            this.progressInfos[idx].percentage = 0;
            this.message = "Could not upload the file:" + file.name;

          });
    },
    dragover(e) {
      e.preventDefault();
      this.isDragging = true;
    },
    dragleave() {
      this.isDragging = false;
    },
    drop(e) {
      e.preventDefault();
      this.$refs.file.files = e.dataTransfer.files;
      this.onChange();
      this.isDragging = false;
    },
    remove(i) {
      this.files.splice(i, 1);
      this.selectedFiles = event.target.files;
    },
    generateURL(file) {
      let fileSrc = URL.createObjectURL(file);
      setTimeout(() => {
        URL.revokeObjectURL(fileSrc);
      }, 1000);
      return fileSrc;
    },
  },

};

</script>

<template>
  <div
      :style="isDragging && 'border-color: green;'"
      class="dropzone-container"
      @dragover="dragover"
      @dragleave="dragleave"
      @drop="drop"
  >
    <input
        type="file"
        multiple
        name="file"
        id="fileInput"
        class="hidden-input"
        @change="onChange"
        ref="file"
    />


    <label for="fileInput" class="file-label">
      <div v-if="isDragging">Release to drop files here.</div>
      <div v-else>Drop files here or <u>click here</u> to upload.</div>
    </label>
    <div class="preview-container mt-4" v-if="files.length">
      <div v-for="file in files" :key="file.name" class="preview-card">
        <div>
          <img class="preview-img"  :src=generateURL(file)  />

          <p>
            {{ file.name }}
            {{ Math.round(file.size / 1000) + "kb" }}
          </p>
        </div>
        <div>
          <button
              class="ml-2"
              type="button"
              @click="remove(files.indexOf(file))"
              title="Remove file"
          >
            <b>×</b>
          </button>
        </div>
      </div>
    </div>
  </div>

  <button class="btn btn-success"
          :disabled="!selectedFiles"
          @click="uploadFiles"
  >
    Upload
  </button>
  <div v-if="progressInfos">
    <div class="mb-2"
         v-for="(progressInfo, index) in progressInfos"
         :key="index"
    >
      <span>{{progressInfo.fileName}}</span>
      <div class="progress">
        <div class="progress-bar progress-bar-info"
             role="progressbar"
             :aria-valuenow="progressInfo.percentage"
             aria-valuemin="0"
             aria-valuemax="100"
             :style="{ width: progressInfo.percentage + '%' }"
        >
          {{progressInfo.percentage}}%
        </div>
      </div>
    </div>
  </div>


</template>

<style scoped>
.main {
  display: flex;
  flex-grow: 1;
  align-items: center;
  height: 100vh;
  justify-content: center;
  text-align: center;
}

.dropzone-container {
  padding: 4rem;
  background: #f7fafc;
  border: 2px dashed;
  border-color: #9e9e9e;
}

.hidden-input {
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 1px;
  height: 1px;
}

.file-label {
  font-size: 20px;
  display: block;
  cursor: pointer;
}

.preview-container {
  display: flex;
  margin-top: 2rem;
}

.preview-card {
  display: flex;
  border: 1px solid #a2a2a2;
  padding: 5px;
  margin-left: 5px;
}

.preview-img {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #a2a2a2;
  background-color: #a2a2a2;
}
</style>