var postForm = function ($form, successCallback, errorCallback, fileValidationCallback, allowBiggerFile) {
    $form = $($form);

    var formData = new FormData();
    var params = $form.serializeArray();

    // Confirmation Dialog
    formData.append("ConfirmationDialog", JSON.stringify(ng.getConfirmationDialog()));

    // Add Files
    var validationError;
    var $file = $form.find('[name="file"]');
    if ($file && $file[0] && $file[0].files) {
        $.each($file[0].files, function (i, file) {
            // Prefix the name of uploaded files with "uploadedFiles-"
            // Of course, you can change it to any string
            formData.append('file-' + i, file);
            if (!allowBiggerFile && file.size > Constants.ATTACHMENT_MAX_SIZE) {
                resetFormElement($file);
                fileValidationCallback($file.attr('id'), file);
                validationError = true;
            }
        });
    }
    if (validationError) return;

    // Add standard parameters
    $.each(params, function (i, val) {
        formData.append(val.name, val.value);
    });

    if (ng.root().processing.POST && !params.allowParallelPosts) {
        toastr.warning("Processing... Please wait...");
        return { abort: function () { } };
    }

    return $.ajax({
        url: $form.attr('action'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (data, status, xhr) {
            if (successCallback) successCallback(data, status, xhr);
        },
        error: function (xhr, status, error) {
            if (errorCallback) errorCallback(xhr, status, error);
        }
    });
};

var postFormUrl = function (relativeUrl, params, successCallback, errorCallback, abortCallback) {
    var formData = new FormData();

    // Add RequestVerificationToken
    formData.append("__RequestVerificationToken", encodeURIComponent($('body > [name=__RequestVerificationToken]').val()));

    // Add DATA
    try {
        $.each(params || [], function (key) {
            //console.log(key, params[key], JSON.stringify(params[key]))
            if (key === 'files') {
                // Add Files
                $.each(params[key], function (i, file) {
                    // Prefix the name of uploaded files with "uploadedFiles-"
                    // Of course, you can change it to any string
                    formData.append('file-' + i, file);
                });
            } else {
                formData.append(key, isArray(params[key]) || isObject(params[key]) ? JSON.stringify(params[key]) : params[key]);
            }
        });
    } catch (e) {
        console.log(e.message, params);
        throw e;
    }

    // Add Confirmation Dialog
    formData.append("ConfirmationDialog", JSON.stringify(ng.getConfirmationDialog()));

    if (ng.root().processing.POST && !params.allowParallelPosts) {
        toastr.warning("Processing... Please wait...");
        abortCallback && abortCallback();
        return { abort: function () { } };
    }

    return $.ajax({
        type: 'POST',
        url: rootUrl + relativeUrl,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data, status, xhr) {
            if (successCallback) successCallback(data, status, xhr);
        },
        error: function (xhr, status, error) {
            if (errorCallback) errorCallback(xhr, status, error);
        }
    });
};