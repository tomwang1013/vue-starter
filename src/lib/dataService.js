/**
 * Created by yangchao on 2017/8/31.
 */
import $ from 'jquery'

function ajaxSuccess(res, callback) {
  top._closeTopMask && top._closeTopMask();

  if (typeof res === 'string') {
    if(res === '__LOGOUT'){
      return top.document.body.innerHTML = top.$.i18n('cap.formDesign.misc.logoutAlert');
    }

    try {
      res = JSON.parse(res);
    } catch (ex) {
      return callback({message: 'Parse json failed!'}, res || {});
    }
  }

  // 如果返回的的json有code表示后台有错误
  if (!res || res.code) {
    callback(res);
  } else {
    callback(null, res);
  }
}

function ajaxError(jqXHR, textStatus, errorThrown, url, managerMethod) {
  top._closeTopMask && top._closeTopMask();

  const msg =
    `
    api calling failed：${url}; managerMethod: ${managerMethod}
    error info：textStatus: ${textStatus}, errorThrown: ${JSON.stringify(errorThrown)}
    returned status: ${jqXHR.status}, ${jqXHR.statusText}
    returned info：${JSON.stringify(jqXHR.response)}, ${jqXHR.responseText}
    `;

  // 接口调用时可能会发生网络或后台错误，提示用户重试
  console.error(msg);
  alert(msg);
}

export function ajaxSend(method, managerName, managerMethod, body, callback) {
  top._showTopMask && top._showTopMask();

  var url = '/seeyon/ajax.do?method=ajaxAction&managerName=' + managerName + '&_t=' + Date.now();

  $.ajax({
    url: url,
    type: method,
    data: {
      managerMethod: managerMethod,
      arguments: body ? JSON.stringify([body]) : '[]'
    },
    dataType: 'json',
    headers: {
      CSRFTOKEN: top.CSRFTOKEN || ''
    },
    success: function(res) { ajaxSuccess(res, callback); },
    error: function(jqXHR, textStatus, errorThrown) {
      ajaxError(jqXHR, textStatus, errorThrown, url, managerMethod);
    }
  });
}

// 普通rest统一ajax接口
export function restAjax(type, url, data, callback) {
  $.ajax({
    type,
    url,
    data: (data && type === 'POST') ? JSON.stringify(data) : data,
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    headers: {
      CSRFTOKEN: top.CSRFTOKEN || ''
    },
    success(res) { ajaxSuccess(res, callback); },
    error(jqXHR, textStatus, errorThrown) {
      ajaxError(jqXHR, textStatus, errorThrown, url);
    }
  });
}